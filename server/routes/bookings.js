const router = require('express').Router();
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const wrap = require('../utils/wrap');
const { protect, requireRole } = require('../middleware/auth');
const { checkAvailability } = require('../utils/helpers');

// Confirmed bookings whose check-out date has passed become "completed"
const autoComplete = () =>
  Booking.updateMany({ status: 'confirmed', checkOut: { $lt: new Date() } }, { status: 'completed' });

// ---------- Guest ----------
router.post('/', protect, requireRole('guest'), wrap(async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;
  const inD = new Date(checkIn), outD = new Date(checkOut);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (isNaN(inD) || isNaN(outD) || inD >= outD) return res.status(400).json({ message: 'Invalid dates' });
  if (inD < today) return res.status(400).json({ message: 'Check-in cannot be in the past' });

  const { available, room } = await checkAvailability(roomId, checkIn, checkOut);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (!available) return res.status(409).json({ message: 'Room is not available for these dates' });

  const nights = Math.round((outD - inD) / 86400000);
  const booking = await Booking.create({
    guest: req.user.id, hotel: room.hotel, room: room._id,
    checkIn: inD, checkOut: outD, nights, totalPrice: nights * room.pricePerNight,
  });
  res.status(201).json(booking);
}));

router.get('/mine', protect, requireRole('guest'), wrap(async (req, res) => {
  await autoComplete();
  const bookings = await Booking.find({ guest: req.user.id })
    .populate('hotel', 'name location images').populate('room', 'type pricePerNight')
    .sort({ checkIn: -1 });
  res.json(bookings);
}));

// ---------- Manager ----------
router.get('/hotel', protect, requireRole('manager'), wrap(async (req, res) => {
  await autoComplete();
  const hotel = await Hotel.findOne({ manager: req.user.id });
  if (!hotel) return res.json([]);
  const bookings = await Booking.find({ hotel: hotel._id })
    .populate('guest', 'name email').populate('room', 'type').sort({ createdAt: -1 });
  res.json(bookings);
}));

router.patch('/:id/status', protect, requireRole('manager'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const hotel = await Hotel.findOne({ manager: req.user.id });
  const booking = await Booking.findOne({ _id: req.params.id, hotel: hotel?._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (['cancelled', 'completed'].includes(booking.status))
    return res.status(400).json({ message: `Booking is already ${booking.status}` });
  booking.status = status;
  await booking.save();
  res.json(booking);
}));

// ---------- Guest (by id) ----------
router.patch('/:id/cancel', protect, requireRole('guest'), wrap(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, guest: req.user.id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!['pending', 'confirmed'].includes(booking.status) || booking.checkIn <= new Date())
    return res.status(400).json({ message: 'This booking can no longer be cancelled' });
  booking.status = 'cancelled';
  await booking.save();
  res.json(booking);
}));

router.get('/:id', protect, requireRole('guest'), wrap(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, guest: req.user.id })
    .populate('hotel', 'name location images').populate('room', 'type bedType pricePerNight');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
}));

module.exports = router;
