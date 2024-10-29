const express = require('express');
const axios = require('axios');
const https = require('https');

const router = express.Router();
const agent = new https.Agent({
    rejectUnauthorized: false, // Отключение проверки сертификата
});

router.post('/create-payment', async (req, res) => {
    try {
        console.log(req.body); // Логирование входящих данных

        const { amount, currency, orderNumber } = req.body;

        // Проверка на наличие необходимых полей
        if (!amount || !currency || !orderNumber) {
            return res.status(400).json({ message: 'Необходимо указать сумму, валюту и номер заказа.' });
        }

        // Установка параметров запроса для Сбербанка
        const sbRequest = {
            amount: parseInt(amount * 100), // Сумма в копейках
            currency: currency, // Использование валюты из запроса
            orderNumber: orderNumber, // Уникальный номер заказа
            token: '401643678:TEST:19304f66-8d05-4e61-a90d-cbf1035c4b0c'          // Добавьте токен, если требуется
        };

        const config = {
            headers: { Authorization: `Bearer 401643678:TEST:19304f66-8d05-4e61-a90d-cbf1035c4b0c` },
            httpsAgent: agent // Добавляем агент для отключения проверки сертификата
        };

        // Отправляем запрос на API Сбербанка
        const response = await axios.post(
            'https://securepayments.sberbank.ru/payment/rest/register.do',
            sbRequest,
            config
        );

        if (response.data.errorCode) {
            return res.status(400).json({ message: 'Ошибка при создании платежа', error: response.data });
        }
        if (response.data.errorCode) {
            console.error('Ошибка от API Сбербанка:', response.data);
            return res.status(400).json({ message: 'Ошибка при создании платежа', error: response.data });
        }
        console.log('Ответ от API Сбербанка:', response.data);

        res.status(200).json({
            message: 'Платеж создан успешно',
            paymentUrl: response.data.formUrl,
        });
    } catch (error) {
        console.error('Ошибка при создании платежа:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});


module.exports = router;
