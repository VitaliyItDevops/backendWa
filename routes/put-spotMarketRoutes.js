const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.put('/submit-order', async (req, res) => {
    try {
        // Получаем данные ордера из тела запроса
        const orderData = req.body;

        // Логируем данные для проверки
        console.log('Order received:', orderData);

        // Деструктурируем данные ордера
        const { orderType, quantity, totalPrice, username, collectionName } = orderData;
        const collectionName2 = 'usdtBalance';

        // Создаем модель на основе названия коллекции для монет
        const CoinModel = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({
            user: String,
            balance: Number,
        }, { collection: collectionName }));

        // Создаем модель для usdtBalance
        const UsdtBalance = mongoose.models[collectionName2] || mongoose.model(collectionName2, new mongoose.Schema({
            user: String,
            balance: Number,
        }, { collection: collectionName2 }));

        // Получаем текущие балансы
        const usdtBalanceDoc = await UsdtBalance.findOne({ user: username });
        const coinBalanceDoc = await CoinModel.findOne({ user: username });

        if (!usdtBalanceDoc) {
            return res.status(400).json({ message: 'У пользователя нет баланса USDT' });
        }

        if (orderType === 'Buy' && !coinBalanceDoc) {
            return res.status(400).json({ message: 'У пользователя нет баланса в указанной коллекции монет' });
        }

        // Проверяем, достаточно ли средств для выполнения транзакции
        if (orderType === 'Buy') {
            if (usdtBalanceDoc.balance < totalPrice) {
                return res.status(400).json({ message: 'Недостаточно USDT для покупки' });
            }

            // Обновляем балансы
            await Promise.all([
                UsdtBalance.updateOne(
                    { user: username },
                    { $inc: { balance: -totalPrice } }
                ),
                CoinModel.updateOne(
                    { user: username },
                    { $inc: { balance: quantity } }
                )
            ]);
        } else if (orderType === 'Sell') {
            if (coinBalanceDoc && coinBalanceDoc.balance < quantity) {
                return res.status(400).json({ message: 'Недостаточно монет для продажи' });
            }

            if (usdtBalanceDoc.balance < totalPrice) {
                return res.status(400).json({ message: 'Недостаточно USDT для получения' });
            }

            // Обновляем балансы
            await Promise.all([
                UsdtBalance.updateOne(
                    { user: username },
                    { $inc: { balance: totalPrice } }
                ),
                CoinModel.updateOne(
                    { user: username },
                    { $inc: { balance: -quantity } }
                )
            ]);
        }

        // Отправляем успешный ответ
        res.status(200).json({ message: 'Операция выполнена успешно' });
    } catch (err) {
        console.error('Ошибка при обработке ордера:', err);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;