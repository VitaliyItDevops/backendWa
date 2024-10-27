const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    newsName: {
        type: String,
        required: true,
    },
    newsText: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    source: {
        type: String,
        required: true,
    }
});

const News = mongoose.model('News', newsSchema, 'News');

module.exports = News;
