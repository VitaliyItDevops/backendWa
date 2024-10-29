const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/create-payment', async (req, res) => {
    try {
        const { amount, currency, orderNumber } = req.body;

        // Установка параметров запроса для Сбербанка
        const sbRequest = {
            amount: amount * 100,  // В копейках
            currency: currency || "RUB",
            orderNumber,
            returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
        };

        const config = {
            headers: { Authorization: `Bearer 401643678:TEST:19304f66-8d05-4e61-a90d-cbf1035c4b0c` }
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
