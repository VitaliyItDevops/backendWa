const express = require('express');
const router = express.Router();
const transactionEarnModel = require('../models/transactionEarn.js');

// Поиск транзакций Earn для конкретного пользователя
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.query; // Получаем userId из query-параметров

        if (!username) {
            return res.status(400).send('userId не указан');
        }

        // Находим транзакции Earn по userId
        const transactions = await transactionEarnModel.find({ username });
        console.log('Транзакции Earn:', transactions);

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
            date: item.date,
            quantityCoin: item.quantityCoin,
            yieldAccrued: item.yieldAccrued,
        }));

        res.json({ transactionsEarn: transactionsWithDetails });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;