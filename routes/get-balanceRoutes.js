const express = require('express');
const router = express.Router();
const path = require('path'); // Импортируйте модуль path
const mongoose = require('mongoose');
const fs = require('fs');

router.get('/:username', async (req, res) => {
    console.log('Получен запрос на маршрут:', req.path); // Логируем путь запроса
    console.log('Параметры:', req.params);
    const userId = req.params.username.replace('@', '').toString(); // Удаляем символ @
    console.log(userId);
    if (!userId) {
        return res.status(400).json({ error: 'Необходимо указать userId' });
    }

    try {
        if (!mongoose.connection.readyState) {
            throw new Error('Нет подключения к базе данных');
        }

        // Получаем список всех коллекций с балансами
        const collections = await mongoose.connection.db.listCollections().toArray();
        const balanceCollections = collections
            .map(col => col.name)
            .filter(name => name.endsWith('Balance'));

        // Модель для монет
        const CoinsModel = mongoose.models['coins'] || mongoose.model('coins', new mongoose.Schema({
            coinsName: String,
            coinId: Number
        }, { collection: 'coins' }));

        // Получаем список всех монет
        const allCoins = await CoinsModel.find();

        // Промисы для обработки каждой коллекции балансов
        const balancePromises = balanceCollections.map(async (collectionName) => {
            const BalanceModel = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({
                user: String,
                balance: Number,
            }, { collection: collectionName }));

            const balanceData = await BalanceModel.findOne({ user: userId });

            if (!balanceData) {
                console.log(`Нет данных по коллекции: ${collectionName}`);
                return {
                    collection: collectionName,
                    balance: 0,
                    icon: null,
                    qrCode: null,
                    coinName: collectionName.replace('Balance', ''),
                    coinId: null,
                    networks: {},
                    AllNet: ''
                };
            }

            // Преобразуем Mongoose документ в обычный объект
            const balanceObject = balanceData.toObject();

            // Выводим все ключи для проверки
            console.log(`Ключи для ${collectionName}:`, Object.keys(balanceObject));

            const coinName = collectionName.replace('Balance', '');
            const formattedCoinName = coinName.charAt(0).toUpperCase() + coinName.slice(1).toLowerCase();

            const coinInfo = allCoins.find(coin => coin.coinsName.toLowerCase() === formattedCoinName.toLowerCase());

            // Формируем путь для иконки
            const iconFileName = `${formattedCoinName}Logo.png`;
            const iconFilePath = path.join(__dirname, '..', 'image', 'icon_coin', iconFileName);

            const iconExists = await fs.promises.access(iconFilePath, fs.constants.F_OK)
                .then(() => true)
                .catch(() => false);

            const iconUrl = iconExists ? `/icons/${iconFileName}` : null;

            // Формируем путь для QR-кода
            const qrCodeFileName = `${formattedCoinName}Qrcode.png`;
            const qrCodeFilePath = path.join(__dirname, 'image', 'qr_code', qrCodeFileName);

            const qrCodeExists = await fs.promises.access(qrCodeFilePath, fs.constants.F_OK)
                .then(() => true)
                .catch(() => false);

            const qrCodeUrl = qrCodeExists ? `/qrcode/${qrCodeFileName}` : null;

            // Динамически собираем все сети и их адреса
            const networks = {};
            const allNetworks = [];

            // Обрабатываем преобразованный объект
            Object.keys(balanceObject).forEach((key) => {
                if (key.endsWith('Net')) {
                    networks[key] = balanceObject[key]; // Добавляем в объект networks название сети как ключ и её адрес как значение
                    allNetworks.push(key.replace('Net', '')); // Добавляем название сети в массив AllNet
                }
            });

            console.log(`Сформированные сети для ${collectionName}:`, networks);

            return {
                collection: collectionName,
                balance: balanceData.balance || 0,
                icon: iconUrl,
                qrCode: qrCodeUrl,
                coinName: coinInfo ? coinInfo.coinsName : formattedCoinName,
                coinId: coinInfo ? coinInfo.coinId : null,
                networks, // Теперь в networks добавляются реальные адреса сетей
                AllNet: allNetworks.join(', '), // Перечисляем все сети в виде строки
            };
        });

        // Выполняем все промисы и получаем результаты балансов
        const balanceResults = await Promise.all(balancePromises);

        // Формируем объект с балансами пользователя
        let userBalances = {};
        balanceResults.forEach(result => {
            userBalances[result.collection] = {
                collectionName: result.collection,
                balance: result.balance,
                icon: result.icon,
                qrCode: result.qrCode,
                coinName: result.coinName,
                coinId: result.coinId,
                networks: result.networks, // Адреса кошельков отображаются в networks
                AllNet: result.AllNet, // Все сети одной строкой
            };
        });

        console.log('Результаты перед отправкой на клиент:', userBalances);

        if (Object.keys(userBalances).length === 0) {
            return res.status(404).json({ error: 'Нет данных для указанного пользователя' });
        }

        res.json(userBalances);
    } catch (error) {
        console.error('Ошибка при получении балансов:', error);
        res.status(500).json({ error: 'Произошла ошибка при запросе балансов' });
    }
});

module.exports = router;