const router = require('express').Router();
const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const wrap = require('../utils/wrap');
const { protect, requireRole } = require('../middleware/auth');

// Guest: submit (or update) a review
router.post('/', protect, requireRole('guest'), wrap(async (req, res) => {
  const { hotelId, rating, comment } = req.body;
  const r = Number(rating);
  if (!hotelId || !(r >= 1 && r <= 5)) return res.status(400).json({ message: 'Rating must be 1 to 5' });
  const review = await Review.findOneAndUpdate(
    { hotel: hotelId, guest: req.user.id },
    { rating: r, comment: comment || '' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(review);
}));

// Manager: all reviews for own hotel
router.get('/mine', protect, requireRole('manager'), wrap(async (req, res) => {
  const hotel = await Hotel.findOne({ manager: req.user.id });
  if (!hotel) return res.json([]);
  res.json(await Review.find({ hotel: hotel._id }).populate('guest', 'name').sort({ createdAt: -1 }));
}));

module.exports = router;
