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
        const response = await axios.post(API_URL, requestData);
        console.log('Квитанция успешно создана:', response.data);
        res.status(200).json(response.data); // Возвращаем данные о квитанции клиенту
    } catch (error) {
        console.error('Ошибка при создании квитанции:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Ошибка при создании квитанции', error: error.response ? error.response.data : error.message });
    }


});

module.exports = router;
