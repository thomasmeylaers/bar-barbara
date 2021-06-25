const mongoose = require('mongoose');

const RecipeSchema = mongoose.Schema({
    name: String,
    ingredients: {
        type: Array,
        "default":[]
    },
    price: Number,
    available: Boolean
})

module.exports = mongoose.model('Recipe', RecipeSchema);