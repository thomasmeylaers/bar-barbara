const mongoose = require('mongoose');

const PushSchema = mongoose.Schema({
    endpoint: String,
    expirationTime: Object,
    keys: {
        p256dh:String,
        auth: String
    }
})

module.exports = mongoose.model('Push', PushSchema);