const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    name:String,
    cocktail:String,
    time:String,
    finished:Boolean
})

module.exports = mongoose.model('Order', OrderSchema);