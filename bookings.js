const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainName: { type: String, required: true },
  ticketCount: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);