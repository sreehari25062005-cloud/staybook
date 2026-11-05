const router = require('express').Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Review = require('../models/Review');
const wrap = require('../utils/wrap');
const upload = require('../middleware/upload');
const { protect, requireRole } = require('../middleware/auth');
const { ratingMap, escapeRegex, splitList } = require('../utils/helpers');

// Public: list published hotels with search + filters
router.get('/', wrap(async (req, res) => {
  const { search, minPrice, maxPrice, amenities } = req.query;
  const q = { published: true };
  if (search) {
    const r = new RegExp(escapeRegex(search), 'i');
    q.$or = [{ name: r }, { location: r }];
  }
  if (amenities) {
    q.amenities = { $all: splitList(amenities).map((a) => new RegExp(`^${escapeRegex(a)}$`, 'i')) };
  }
  const hotels = await Hotel.find(q).sort({ createdAt: -1 }).lean();
  const ids = hotels.map((h) => h._id);
  const [rooms, ratings] = await Promise.all([Room.find({ hotel: { $in: ids } }).lean(), ratingMap(ids)]);

  const min = minPrice ? Number(minPrice) : 0;
  const max = maxPrice ? Number(maxPrice) : Infinity;

  const result = hotels
    .map((h) => {
      const prices = rooms.filter((r) => r.hotel.equals(h._id)).map((r) => r.pricePerNight);
      return {
        ...h,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        rating: ratings[h._id.toString()]?.rating || 0,
        reviewCount: ratings[h._id.toString()]?.reviewCount || 0,
      };
    })
    // keep hotels that have at least one room inside the price range
    .filter((h) => (minPrice || maxPrice ? h.minPrice !== null && h.maxPrice >= min && h.minPrice <= max : true));

  res.json(result);
}));

// Manager: own hotel (null if not created yet)
router.get('/mine', protect, requireRole('manager'), wrap(async (req, res) => {
  res.json(await Hotel.findOne({ manager: req.user.id }));
}));

// Manager: create or update own hotel profile + media
router.put('/mine', protect, requireRole('manager'),
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]),
  wrap(async (req, res) => {
    const { name, location, description, amenities, published, keepImages, keepVideo } = req.body;
    if (!name || !location) return res.status(400).json({ message: 'Name and location are required' });

    const hotel = (await Hotel.findOne({ manager: req.user.id })) || new Hotel({ manager: req.user.id });
    hotel.name = name;
    hotel.location = location;
    hotel.description = description || '';
    hotel.amenities = splitList(amenities);
    hotel.published = published === 'true';

    const kept = keepImages ? JSON.parse(keepImages) : hotel.images || [];
    hotel.images = [...kept, ...(req.files?.images || []).map((f) => f.path)];
    if (req.files?.video?.[0]) hotel.video = req.files.video[0].path;
    else if (keepVideo === 'false') hotel.video = '';

    await hotel.save();
    res.json(hotel);
  })
);

// Public: hotel detail with rooms and reviews
router.get('/:id', wrap(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id).lean();
  if (!hotel || !hotel.published) return res.status(404).json({ message: 'Hotel not found' });
  const [rooms, reviews] = await Promise.all([
    Room.find({ hotel: hotel._id }).lean(),
    Review.find({ hotel: hotel._id }).populate('guest', 'name').sort({ createdAt: -1 }).lean(),
  ]);
  const count = reviews.length;
  const rating = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  res.json({ hotel, rooms, reviews, rating, reviewCount: count });
}));

module.exports = router;
