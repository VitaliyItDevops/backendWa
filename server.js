const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();


app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});


app.options('*', cors())


app.use(express.json());
app.use(bodyParser.json());

app.options('/api/*', cors());  // Обрабатываем предварительные запросы CORS для всех маршрутов, начинающихся с /api


const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
};

app.use(cors(corsOptions));

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

app.use('/api', exchangeRoutes);
app.use('/api', sentCoinsRotes);
app.use('/api', spotMarketRoutes);
app.use('/api', stakeRoutes);
app.use('/api', unstakeRoutes);
app.use('/api', newsRoutes);
app.use('/api/balanceAll', balanceRoutes);
app.use('/api', transactionCoinRoutes);
app.use('/api', earnBalanceRoutes);
app.use('/api', transactionEarnRoutes);
mongoose.connect(process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to database'))
    .catch((err) => console.error('Database connection error:', err));





const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Статический сервер для изображений новостей

app.use('/icons', express.static(path.join(__dirname,  'image', 'icon_coin')));
app.use('/qrcode', express.static(path.join(__dirname, 'image', 'qr_code')));
app.use('/images', express.static(path.join(__dirname, 'image', 'news_preview')));

