const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();


app.use((req, res, next) => {
    console.log('Headers:', req.headers);
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

app.use(express.json());
app.use(bodyParser.json());



const allowedOrigins = [
    'https://0152-188-163-45-97.ngrok-free.app',
    'https://web.telegram.org', // если нужно разрешить и Telegram WebApp
    'https://api.volet.com' // домен API Volet
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'username'],
    credentials: true
};

app.use(cors(corsOptions));


app.options('*', cors(corsOptions));  // Разрешаем preflight-запросы для всех маршрутов

// Импортируем маршруты
const exchangeRoutes = require('./routes/put-exchangeRoutes');
const sentCoinsRotes = require('./routes/put-sentCoinRoutes');
const spotMarketRoutes = require('./routes/put-spotMarketRoutes');
const stakeRoutes = require('./routes/put-stakeRotes');
const unstakeRoutes = require('./routes/put-unstakeRoutes');
const balanceRoutes = require('./routes/get-balanceRoutes');
const newsRoutes = require('./routes/get-newsRoutes');
const earnBalanceRoutes = require('./routes/get-earnBalanceRoutes');
const transactionCoinRoutes = require('./routes/get-transactionCoinRoutes');
const transactionEarnRoutes = require('./routes/get-transactionEarnRoutes');
const paymentRoutes = require('./routes/post-paymentRoutes');

app.use('/api', paymentRoutes)
app.use('/api', exchangeRoutes);
app.use('/api', sentCoinsRotes);
app.use('/api', spotMarketRoutes);
app.use('/api', stakeRoutes);
app.use('/api', unstakeRoutes);
app.use('/api', newsRoutes);
app.use('/api/balanceAll', balanceRoutes);
app.use('/api/transactions', transactionCoinRoutes);
app.use('/api/earns_coins', earnBalanceRoutes);
app.use('/api/transactionsEarn', transactionEarnRoutes);
mongoose.connect(process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to database'))
    .catch((err) => console.error('Database connection error:', err));





const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Статический сервер для изображений новостей

app.use('/icons', express.static(path.join(__dirname,  'image', 'icon_coin')));
app.use('/qrcode', express.static(path.join(__dirname, 'image', 'qr_code')));
app.use('/images', express.static(path.join(__dirname, 'image', 'news_preview')));

