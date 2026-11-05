const mongoose = require('mongoose');
module.exports = mongoose.model('Hotel', new mongoose.Schema({
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: String,
  amenities: [String],
  images: [String],
  video: { type: String, default: '' },
  published: { type: Boolean, default: false },
}, { timestamps: true }));
