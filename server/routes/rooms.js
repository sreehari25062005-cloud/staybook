const router = require('express').Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const wrap = require('../utils/wrap');
const upload = require('../middleware/upload');
const { protect, requireRole } = require('../middleware/auth');
const { splitList, checkAvailability } = require('../utils/helpers');

const manager = [protect, requireRole('manager')];

const fields = (b) => ({
  type: b.type,
  pricePerNight: Number(b.pricePerNight),
  maxOccupancy: Number(b.maxOccupancy) || 2,
  bedType: b.bedType,
  features: splitList(b.features),
  totalRooms: Number(b.totalRooms) || 1,
});

// Public: real-time availability for a date range
router.get('/:id/availability', wrap(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut))
    return res.status(400).json({ message: 'Invalid dates' });
  const { available, left, room } = await checkAvailability(req.params.id, checkIn, checkOut);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  res.json({ available, left, nights, totalPrice: nights * room.pricePerNight });
}));

router.get('/mine', ...manager, wrap(async (req, res) => {
  const hotel = await Hotel.findOne({ manager: req.user.id });
  res.json(hotel ? await Room.find({ hotel: hotel._id }).sort({ createdAt: -1 }) : []);
}));

router.post('/', ...manager, upload.array('images', 6), wrap(async (req, res) => {
  const hotel = await Hotel.findOne({ manager: req.user.id });
  if (!hotel) return res.status(400).json({ message: 'Create your hotel profile first' });
  const room = await Room.create({ ...fields(req.body), hotel: hotel._id, images: (req.files || []).map((f) => f.path) });
  res.status(201).json(room);
}));

router.put('/:id', ...manager, upload.array('images', 6), wrap(async (req, res) => {
  const hotel = await Hotel.findOne({ manager: req.user.id });
  const room = await Room.findOne({ _id: req.params.id, hotel: hotel?._id });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  Object.assign(room, fields(req.body));
  const kept = req.body.keepImages ? JSON.parse(req.body.keepImages) : room.images;
  room.images = [...kept, ...(req.files || []).map((f) => f.path)];
  await room.save();
  res.json(room);
}));

router.delete('/:id', ...manager, wrap(async (req, res) => {
  const hotel = await Hotel.findOne({ manager: req.user.id });
  const room = await Room.findOneAndDelete({ _id: req.params.id, hotel: hotel?._id });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json({ message: 'Room deleted' });
}));

module.exports = router;
