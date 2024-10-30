const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const router = express.Router();

const API_NAME = 'Henderson Land';
const API_PASSWORD = 'It321987645!';
const ACCOUNT_EMAIL = 'vitalikarpinec228@gmail.com';
const API_URL = 'https://api.volet.com/create_invoice';

// Функция для создания токена аутентификации
const createAuthToken = () => {
    const dateUTC = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const hoursUTC = new Date().getUTCHours();
    const text = `${API_PASSWORD}:${dateUTC}:${hoursUTC}`;
    return crypto.createHash('sha256').update(text).digest('hex');
};

router.post('/create-payment', async (req, res) => {
    const { amount, currency, orderNumber } = req.body;
    const authToken = createAuthToken();

    const requestData = {
        api_name: API_NAME,
        auth_token: authToken,
        account_email: ACCOUNT_EMAIL,
        amount,
        currency,
        order_number: orderNumber,
    };

    try {
        // Извлечение данных прокси из переменной окружения
        const [proxyUser, proxyPass] = process.env.FIXIE_URL.split('@')[0].split('://')[1].split(':');
        const proxyHost = process.env.FIXIE_URL.split('@')[1].split(':')[0];
        const proxyPort = process.env.FIXIE_URL.split(':')[2].split('/')[0];

        const response = await axios.post(API_URL, requestData, {
            proxy: {
                host: proxyHost,
                port: Number(proxyPort),
                auth: {
                    username: proxyUser,
                    password: proxyPass
                }
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: true // Убедитесь, что проверка сертификата включена
            })
        });
        console.log('Квитанция успешно создана:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ошибка при создании квитанции:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Ошибка при создании квитанции', error: error.response ? error.response.data : error.message });
    }
});

module.exports = router;
