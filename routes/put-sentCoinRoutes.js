const express = require('express');
const mongoose = require('mongoose');
const transactionCoinModel = require("../models/transaction");
const router = express.Router();

router.put('/sent_coins', async (req, res) => {
    try {
        const { username, sentData } = req.body;
        const { amountRecieved, collectionName, coinName, amountUsdt } = sentData;

        console.log('Request to send coins received:', req.body);

        // Проверка подключения к базе данных
        if (!mongoose.connection.readyState) {
            throw new Error('Нет подключения к базе данных');
        }
        const quantityUsdt = amountRecieved; // Предполагаем, что в запросе отправляется в USDT

        // Проверка на отрицательные или нулевые значения
        if (amountRecieved <= 0) {
            const newTransaction = new transactionCoinModel({
                username,
                type: 'Sent',
                coin: coinName, // Название монеты берем из имени коллекции
                status: 'rejected',
                quantityUsdt: quantityUsdt, // Количество в USDT
                quantityCoin: amountRecieved // Количество в самой монете
            });

            await newTransaction.save();
            console.log('Транзакция сохранена:', newTransaction);

            return res.status(400).json({ message: 'Amount must be greater than zero' });

        }

        // Создаем модель на основе названия коллекции
        const BalanceModel = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({
            user: String,
            balance: Number,
        }, { collection: collectionName }));

        // Поиск баланса пользователя по ID
        const userBalance = await BalanceModel.findOne({ user: username });

        if (!userBalance) {

            console.log(`Нет данных для пользователя в коллекции ${collectionName}`);

            return res.status(404).json({ message: `Document not found for user in ${collectionName}` });

        }

        console.log('Баланс пользователя найден:', userBalance);

        // Проверка наличия достаточного баланса для отправки
        if (userBalance.balance < amountRecieved) {
            return res.status(400).json({ message: `Insufficient balance to send ${amountRecieved}` });
        }

        // Рассчитаем количество в USDT (если есть необходимость)

        // Обновляем баланс: уменьшаем баланс пользователя
        const updatedBalance = await BalanceModel.findOneAndUpdate(
            { user: username },
            { $inc: { balance: -amountRecieved } }, // Уменьшаем баланс на отправленное количество
            { new: true }
        );

        console.log('Обновленный баланс:', updatedBalance);

        // Сохраняем транзакцию
        const newTransaction = new transactionCoinModel({
            username,
            type: 'Sent',
            coin: coinName, // Название монеты берем из имени коллекции
            status: 'confirmed',
            quantityUsdt: amountUsdt, // Количество в USDT
            quantityCoin: amountRecieved // Количество в самой монете
        });

        await newTransaction.save();
        console.log('Транзакция сохранена:', newTransaction);

        return res.status(200).json({
            message: 'Transaction successful!',
            updatedBalance,
            transaction: newTransaction
        });

    } catch (error) {
        console.error('Ошибка при отправке монет:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
