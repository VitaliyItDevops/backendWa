const express = require('express');
const router = express.Router();
const transactionCoinModel = require('../models/transaction.js');

// Поиск всех транзакций для конкретного пользователя
router.get('/transactions', async (req, res) => {
    try {
        const { username } = req.query.username; // Получаем userId из query-параметров

        if (!username) {
            return res.status(400).send('userId не указан');
        }

        // Находим транзакции по userId
        const transactions = await transactionCoinModel.find({ username });
        console.log('Транзакции:', transactions);

        if (!transactions.length) {
            return res.status(404).send('Транзакции не найдены');
        }

        // Форматируем транзакции для ответа
        const transactionsWithDetails = transactions.map((item) => ({
            _id: item._id,
            userId: item.userId,
            type: item.type,
            coin: item.coin,
            status: item.status,
            quantityUsdt: item.quantityUsdt,
            quantityCoin: item.quantityCoin,
            date: item.date
        }));

        res.json({ transactions: transactionsWithDetails });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
