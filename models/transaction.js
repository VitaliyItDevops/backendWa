const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  coin: { type: String, required: true },
  status: { type: String, required: true },
  quantityUsdt: { type: Number, required: true },
  quantityCoin: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { collection: 'transactionCoin' });

module.exports = mongoose.model('transactionCoin', transactionSchema);
