const router = require('express').Router();
const Inquiry = require('../models/Inquiry');
const Hotel = require('../models/Hotel');
const wrap = require('../utils/wrap');
const { protect, optionalAuth, requireRole } = require('../middleware/auth');

// Contact form on hotel detail page (guests, or visitors)
router.post('/', optionalAuth, wrap(async (req, res) => {
  const { hotelId, name, email, message } = req.body;
  if (!hotelId || !name || !email || !message) return res.status(400).json({ message: 'All fields are required' });
  if (req.user?.role === 'manager') return res.status(403).json({ message: 'Managers cannot send inquiries' });
  const inquiry = await Inquiry.create({ hotel: hotelId, name, email, message, guest: req.user?.id });
  res.status(201).json(inquiry);
}));

// Manager inbox
router.get('/mine', protect, requireRole('manager'), wrap(async (req, res) => {
  const hotel = await Hotel.findOne({ manager: req.user.id });
  if (!hotel) return res.json([]);
  res.json(await Inquiry.find({ hotel: hotel._id }).sort({ createdAt: -1 }));
}));

module.exports = router;
