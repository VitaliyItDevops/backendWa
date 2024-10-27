const mongoose = require('mongoose');

// Функция для создания модели с проверкой на существование
function createBalanceModel(collectionName) {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName]; // Если модель уже существует, возвращаем её
  }

  // Определяем схему, если модель ещё не создана
  const balanceSchema = new mongoose.Schema({
    user: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    adress: { type: String, required: true }
  });

  // Создаем и возвращаем модель с указанной коллекцией
  return mongoose.model(collectionName, balanceSchema);
}

module.exports = createBalanceModel;
