const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');

const uploadDir = path.join(__dirname, '../image/news_preview');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для обработки файлов
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
        const newsId = req.body.news_id || Date.now(); // Проверяем, что news_id передается
        const fileExt = path.extname(file.originalname) || '.png'; // Указываем расширение по умолчанию
        cb(null, `${newsId}${fileExt}`); // Устанавливаем news_id как имя файла
    }
});

const upload = multer({ storage: storage });

// Эндпоинт для загрузки изображений
router.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        if (req.file) {
            res.status(200).json({
                message: 'Изображение успешно сохранено',
                filePath: req.file.path,
                newsId: req.body.news_id
            });
        } else {
            res.status(400).json({ message: 'Не удалось загрузить изображение' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});

module.exports = router;
