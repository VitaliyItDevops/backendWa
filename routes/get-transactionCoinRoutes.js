const express = require('express');
const router = express.Router();
const transactionCoinModel = require('../models/transaction.js');

// Поиск всех транзакций для конкретного пользователя
router.get('/:username', async (req, res) => {
    try {
        const username = req.params.username.replace('@', '').toString(); // Правильное извлечение

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
            username: item.username,
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
