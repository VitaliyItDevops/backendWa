const mongoose = require('mongoose');

const transactionEarnSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    coin: { type: String, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    quantityCoin: { type: Number, required: true },
    yieldAccrued: { type: Number, required: true },
}, { collection: 'transactionStake' });

module.exports = mongoose.model('transactionEarn', transactionEarnSchema);
