const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


router.put('/stake', async (req, res) => {
    try {
        const { collectionName, amount, username, collectionName2, coinName } = req.body;

        console.log('Stake request received:', req.body);

        if (!mongoose.connection.readyState) {
            throw new Error('Нет подключения к базе данных');
        }

        if (amount <= 0) {
            const TransactionModel = mongoose.model('transactionEarn');
            await TransactionModel.create({
                userId: username,
                type: 'Stake',
                coin: coinName,
                status: 'rejected',
                quantityCoin: amount,
                yieldAccrued: 0,
            });
            return res.status(400).json({ message: 'Stake amount must be greater than zero' });
        }

        const EarnModel = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({
            user: String,
            earnBalance: Number,
            earnTotalYield: Number,
        }, { collection: collectionName }));

        const MainBalanceModel = mongoose.models[collectionName2] || mongoose.model(collectionName2, new mongoose.Schema({
            user: String,
            balance: Number,
        }, { collection: collectionName2 }));

        const mainBalanceData = await MainBalanceModel.findOne({ user: username });

        if (!mainBalanceData) {
            const TransactionModel = mongoose.model('transactionEarn');
            await TransactionModel.create({
                userId: username,
                type: 'Stake',
                coin: coinName,
                status: 'rejected',
                quantityCoin: amount,
                yieldAccrued: 0,
            });
            console.log(`Нет основного баланса для пользователя в коллекции ${collectionName2}`);
            return res.status(404).json({ message: `No main balance data found in ${collectionName2}` });
        }

        if (mainBalanceData.balance < amount) {
            const TransactionModel = mongoose.model('transactionEarn');
            await TransactionModel.create({
                userId: username,
                type: 'Stake',
                coin: coinName,
                status: 'rejected',
                quantityCoin: amount,
                yieldAccrued: 0,
            });
            return res.status(400).json({ message: 'Insufficient main balance' });
        }

        const updatedMainBalance = await MainBalanceModel.findOneAndUpdate(
            { user: username },
            { $inc: { balance: -amount } },
            { new: true }
        );

        let earnData = await EarnModel.findOne({ user: username });

        if (!earnData) {
            earnData = await EarnModel.create({
                user: username,
                earnBalance: amount,
                earnTotalYield: 0,
            });
        } else {
            earnData = await EarnModel.findOneAndUpdate(
                { user: username },
                { $inc: { earnBalance: amount } },
                { new: true }
            );
        }

        // Сохранение транзакции стейкинга
        const TransactionModel = mongoose.model('transactionEarn');
        await TransactionModel.create({
            userId: username,
            type: 'Stake',
            coin: coinName,
            status: 'confirmed',
            quantityCoin: amount,
            yieldAccrued: 0,
        });

        return res.status(200).json({ message: 'Stake successful!', updatedMainBalance, earnData });

    } catch (error) {
        console.error('Ошибка обработки stake:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;