const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


router.put('/unstake', async (req, res) => {
    try {
        const { collectionName, amount, username, collectionName2, coinName } = req.body;

        console.log('Unstake request received:', req.body);

        if (!mongoose.connection.readyState) {
            throw new Error('Нет подключения к базе данных');
        }

        if (amount <= 0) {
            const TransactionModel = mongoose.model('transactionEarn');
            await TransactionModel.create({
                userId: username,
                type: 'Unstake',
                coin: coinName,
                status: 'rejected',
                quantityCoin: amount,
                yieldAccrued: earnData.earnTotalYield,
            });
            return res.status(400).json({ message: 'Unstake amount must be greater than zero' });
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

        const earnData = await EarnModel.findOne({ user: username });

        if (!earnData) {
            const TransactionModel = mongoose.model('transactionEarn');
            await TransactionModel.create({
                userId: username,
                type: 'Unstake',
                coin: coinName,
                status: 'rejected',
                quantityCoin: amount,
                yieldAccrued: earnData.earnTotalYield,
            });
            console.log(`Нет данных для пользователя в коллекции ${collectionName}`);
            return res.status(404).json({ message: `No staking data found in ${collectionName}` });
        }

        if (earnData.earnBalance < amount) {
            const TransactionModel = mongoose.model('transactionEarn');
            await TransactionModel.create({
                userId: username,
                type: 'Unstake',
                coin: coinName,
                status: 'rejected',
                quantityCoin: amount,
                yieldAccrued: earnData.earnTotalYield,
            });
            return res.status(400).json({ message: 'Insufficient staking balance' });
        }

        const updatedEarnBalance = await EarnModel.findOneAndUpdate(
            { user: username },
            { $inc: { earnBalance: -amount }, $set: { earnTotalYield: 0 } },
            { new: true }
        );

        const amountToAdd = amount + earnData.earnTotalYield;
        const updatedMainBalance = await MainBalanceModel.findOneAndUpdate(
            { user: username },
            { $inc: { balance: amountToAdd } },
            { new: true }
        );

        if (!updatedMainBalance) {
            await MainBalanceModel.create({ user: username, balance: amountToAdd });
        }

        // Сохранение транзакции анстейкинга
        const TransactionModel = mongoose.model('transactionEarn');
        await TransactionModel.create({
            userId: username,
            type: 'Unstake',
            coin: coinName,
            status: 'confirmed',
            quantityCoin: amount,
            yieldAccrued: earnData.earnTotalYield,
        });

        return res.status(200).json({ message: 'Unstake successful!', updatedEarnBalance, updatedMainBalance });

    } catch (error) {
        console.error('Ошибка обработки unstake:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;