const mongoose = require('mongoose');

const ClientSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    bill: {
        type:Array,
        "default" : []
    },
    card: Number,
    id: String
})

module.exports = mongoose.model('Bills', ClientSchema);