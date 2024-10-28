const express = require('express');
const router = express.Router();
const path = require('path'); // Импортируйте модуль path
const fs = require('fs');
const mongoose = require('mongoose');


router.get('/:username', async (req, res) => {
    const { username } = req.params.username.replace('@', '').toString();

    if (!username) {
        return res.status(400).json({ error: 'Необходимо указать userId' });
    }

    try {
        if (!mongoose.connection.readyState) {
            throw new Error('Нет подключения к базе данных');
        }

        const collections = await mongoose.connection.db.listCollections().toArray();
        const earnCollections = collections
            .map(col => col.name)
            .filter(name => name.endsWith('Earn'));

        const EarnsModel = mongoose.models['earns'] || mongoose.model('earns', new mongoose.Schema({
            earnsName: String,
        }, { collection: 'earns' }));

        const allEarns = await EarnsModel.find();

        const earnPromises = earnCollections.map(async (collectionName) => {
            const EarnModel = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({
                user: String,
                earnBalance: Number,
                earnPercent: Number,
                earnDate: Date,
                earnTotalYield: Number,
            }, { collection: collectionName }));

            const earnData = await EarnModel.findOne({ user: username });

            if (!earnData) {
                console.log(`Нет данных по коллекции: ${collectionName}`);
                return {
                    collection: collectionName,
                    earnBalance: 0,
                    earnPercent: 0,
                    earnDate: 0,
                    earnTotalYield: 0,
                    icon: null,
                    earnName: collectionName.replace('Earn', ''),
                };
            }

            const earnName = collectionName.replace('Earn', '');
            const formattedEarnName = earnName.charAt(0).toUpperCase() + earnName.slice(1).toLowerCase();
            const earnInfo = allEarns.find(earn => earn.earnsName.toLowerCase() === formattedEarnName.toLowerCase());

            // Формируем путь для иконки
            const iconFileName = `${formattedEarnName}Logo.png`;
            const iconFilePath = path.join(__dirname, '..', 'image', 'icon_coin', iconFileName);

            const iconExists = await fs.promises.access(iconFilePath, fs.constants.F_OK)
                .then(() => true)
                .catch(() => false);

            const iconUrl = iconExists ? `/icons/${iconFileName}` : null;

            return {
                collection: collectionName,
                earnBalance: earnData.earnBalance || 0,
                earnPercent: earnData.earnPercent || 0,
                earnName: earnInfo ? earnInfo.earnsName : formattedEarnName,
                earnDate: earnData.earnDate || earnInfo?.earnDate,
                earnTotalYield: earnData.earnTotalYield || 0,
                icon: iconUrl, // Добавляем URL иконки в результат
            };
        });

        const earnResults = await Promise.all(earnPromises);

        let userEarns = {};
        earnResults.forEach(result => {
            userEarns[result.collection] = {
                collectionName: result.collection,
                earnBalance: result.earnBalance,
                earnPercent: result.earnPercent,
                earnDate: result.earnDate,
                earnName: result.earnName,
                earnTotalYield: result.earnTotalYield,
                icon: result.icon, // Добавляем иконку в итоговый объект
            };
        });

        console.log('Результаты перед отправкой на клиент:', userEarns);

        res.json(userEarns);
    } catch (error) {
        console.error('Ошибка при получении earn данных:', error);
        res.status(500).json({ error: 'Ошибка при получении earn данных' });
    }
});

module.exports = router;