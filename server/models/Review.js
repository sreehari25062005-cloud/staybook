const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });
schema.index({ hotel: 1, guest: 1 }, { unique: true }); // one review per guest per hotel
module.exports = mongoose.model('Review', schema);
