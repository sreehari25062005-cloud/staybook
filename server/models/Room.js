const mongoose = require('mongoose');
module.exports = mongoose.model('Room', new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  type: { type: String, required: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  maxOccupancy: { type: Number, default: 2 },
  bedType: String,
  features: [String],
  images: [String],
  totalRooms: { type: Number, default: 1, min: 1 },
}, { timestamps: true }));
