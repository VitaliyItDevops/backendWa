const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();

const API_NAME = 'Henderson Land'; // Укажите ваше имя API
const API_PASSWORD = 'It321987645!'; // Укажите ваш пароль API
const ACCOUNT_EMAIL = 'vitalikarpinec228@gmail.com'; // Укажите ваш email аккаунта
const API_URL = 'https://api.volet.com/create_invoice'; // URL для создания квитанции

// Функция для создания токена аутентификации
const createAuthToken = () => {
    const dateUTC = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const hoursUTC = new Date().getUTCHours(); // Часы в UTC
    const text = `${API_PASSWORD}:${dateUTC}:${hoursUTC}`;
    return crypto.createHash('sha256').update(text).digest('hex');
};

// Установка Fixie URL как прокси для axios
const FIXIE_URL = process.env.FIXIE_URL; // Убедитесь, что вы установили FIXIE_URL в переменные окружения

// Создание экземпляра axios с прокси
const axiosInstance = axios.create({
    baseURL: API_URL,
    proxy: {
        host: FIXIE_URL.split('@')[1].split(':')[0], // Извлекаем хост из FIXIE_URL
        port: 80,
        auth: {
            username: FIXIE_URL.split('//')[1].split(':')[0], // Извлекаем имя пользователя из FIXIE_URL
            password: FIXIE_URL.split(':')[2].split('@')[0] // Извлекаем пароль из FIXIE_URL
        }
    }
});

router.post('/create-payment', async (req, res) => {
    const { amount, currency, orderNumber } = req.body;

    // Создание токена
    const authToken = createAuthToken();

    // Формирование данных для запроса на Volet
    const requestData = {
        api_name: API_NAME,
        auth_token: authToken,
        account_email: ACCOUNT_EMAIL,
        amount,
        currency,
        order_number: orderNumber, // Исправил на "order_number"
    };

    try {
        // Отправка запроса на Volet для создания квитанции
        const response = await axiosInstance.post('/', requestData); // Используем экземпляр axios с прокси
        console.log('Квитанция успешно создана:', response.data);
        res.status(200).json(response.data); // Возвращаем данные о квитанции клиенту
    } catch (error) {
        console.error('Ошибка при создании квитанции:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Ошибка при создании квитанции', error: error.response ? error.response.data : error.message });
    }
});

module.exports = router;
