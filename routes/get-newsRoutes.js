const express = require('express');
const router = express.Router();
const path = require('path'); // Импортируйте модуль path
const fs = require('fs');
const News = require("../models/news");

router.get('/news', async (req, res) => {
    try {
        const news = await News.find();

        if (!news.length) {
            return res.status(404).send('Новости не найдены');
        }

        const newsWithImages = await Promise.all(news.map(async (item) => {
            const imageFileName = `${item._id}.png`;
            const imageFilePath = path.join(__dirname, '..', 'image', 'news_preview', imageFileName);

            const imageExists = await fs.promises.access(imageFilePath, fs.constants.F_OK)
                .then(() => true)
                .catch(() => false);

            return {
                _id: item._id,
                newsName: item.newsName,
                newsText: item.newsText,
                date: item.date,
                source: item.source,
                image: imageExists ? `/images/${imageFileName}` : null
            };
        }));

        res.json({ news: newsWithImages });
    } catch (err) {
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;