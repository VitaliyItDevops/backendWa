const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
}, { collection: 'my_custom_users' }); // название коллекции в MongoDB

const User = mongoose.model('User', userSchema); // название модели в коде

module.exports = User;
