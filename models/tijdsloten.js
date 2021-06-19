const mongoose = require('mongoose');

const TijdslotSchema = mongoose.Schema({
    day:String,
    month:String,
    registered:{
        type:Array,
        "default":[]
    },
    occupied: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Tijdslot', TijdslotSchema);