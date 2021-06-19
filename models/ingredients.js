const mongoose = require('mongoose');

const IngredientSchema = mongoose.Schema({
    name: String,
    price: Number
})

module.exports = mongoose.model('Ingredients', IngredientSchema);