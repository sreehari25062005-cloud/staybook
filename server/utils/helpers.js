const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

exports.escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.splitList = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

// { hotelId: { rating, reviewCount } }
exports.ratingMap = async (ids) => {
  const agg = await Review.aggregate([
    { $match: { hotel: { $in: ids } } },
    { $group: { _id: '$hotel', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const map = {};
  agg.forEach((a) => (map[a._id.toString()] = { rating: Math.round(a.avg * 10) / 10, reviewCount: a.count }));
  return map;
};

// A room type is available if overlapping active bookings < number of rooms of that type
exports.checkAvailability = async (roomId, checkIn, checkOut) => {
  const room = await Room.findById(roomId);
  if (!room) return { available: false, left: 0, room: null };
  const overlapping = await Booking.countDocuments({
    room: roomId,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
  const left = Math.max(room.totalRooms - overlapping, 0);
  return { available: left > 0, left, room };
};
