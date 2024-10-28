const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Маршрут для обмена монетами
router.put('/exchange-coins', async (req, res) => {
    try {
        const { coin1, coin2, username } = req.body;
        const { name: coin1Name, amount: coin1Amount, rate: coin1Rate, collectionName: coin1Collection } = coin1;
        const { name: coin2Name, rate: coin2Rate, collectionName: coin2Collection } = coin2;

        console.log('Exchange request received:', req.body);

        // Проверка подключения к базе данных
        if (!mongoose.connection.readyState) {
            throw new Error('Нет подключения к базе данных');
        }

        // Проверка на отрицательные или нулевые значения
        if (coin1Amount <= 0) {
            return res.status(400).json({ message: 'Amount for the first coin must be greater than zero' });
        }

        // Проверка на одинаковые монеты
        if (coin1Name === coin2Name) {
            return res.status(400).json({ message: 'Cannot exchange the same coin' });
        }

        // Создаем модели на основе названия коллекций
        const BalanceModelCoin1 = mongoose.models[coin1Collection] || mongoose.model(coin1Collection, new mongoose.Schema({
            user: String,
            balance: Number,
        }, { collection: coin1Collection }));

        const BalanceModelCoin2 = mongoose.models[coin2Collection] || mongoose.model(coin2Collection, new mongoose.Schema({
            user: String,
            balance: Number,
        }, { collection: coin2Collection }));

        // Поиск балансов пользователя
        const balanceCoin1 = await BalanceModelCoin1.findOne({ user: username });
        const balanceCoin2 = await BalanceModelCoin2.findOne({ user: username });

        if (!balanceCoin1) {
            return res.status(404).json({ message: `Document not found for ${coin1Name} in ${coin1Collection}` });
        }

        if (!balanceCoin2) {
            return res.status(404).json({ message: `Document not found for ${coin2Name} in ${coin2Collection}` });
        }

        // Проверка достаточного баланса для первой монеты
        if (balanceCoin1.balance < coin1Amount) {
            return res.status(400).json({ message: `Insufficient ${coin1Name} balance` });
        }

        // Рассчитываем эквивалент первой монеты в USDT
        const coin1ValueInUSDT = coin1Amount * coin1Rate;

        // Рассчитываем количество второй монеты для прибавления
        const coin2AmountToAdd = coin1ValueInUSDT / coin2Rate;

        // Обновляем балансы
        const updatedCoin1Balance = await BalanceModelCoin1.findOneAndUpdate(
            { user: username },
            { $inc: { balance: -coin1Amount } }, // Уменьшаем баланс первой монеты
            { new: true }
        );

        const updatedCoin2Balance = await BalanceModelCoin2.findOneAndUpdate(
            { user: username },
            { $inc: { balance: coin2AmountToAdd } }, // Увеличиваем баланс второй монеты
            { new: true }
        );

        return res.status(200).json({ message: 'Exchange successful!', updatedCoin1Balance, updatedCoin2Balance });

    } catch (error) {
        console.error('Ошибка обработки обмена:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
