const express = require('express');
const axios = require('axios');
const https = require('https');

const router = express.Router();
const agent = new https.Agent({
    rejectUnauthorized: false, // Отключение проверки сертификата
});

router.post('/create-payment', async (req, res) => {
    try {
        console.log(req.body); // Добавьте это для проверки входящих данных

        const { amount, currency, orderNumber } = req.body;

        // Установка параметров запроса для Сбербанка
        const sbRequest = {
            amount: 100, // Сумма в рублях (без копеек)
            currency: "RUB",
            orderNumber: "123456" // Уникальный номер заказа
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

        res.status(200).json({
            message: 'Платеж создан успешно',
            paymentUrl: response.data.formUrl,
        });
    } catch (error) {
        console.error('Ошибка при создании платежа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
