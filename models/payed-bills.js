const mongoose = require('mongoose');

const PayedSchema = mongoose.Schema({
    username:String,
    payed:[{
        cocktails: {
            type: Array,
            default: []
        },
        date: String
    }]
})

module.exports = mongoose.model('Payed', PayedSchema);