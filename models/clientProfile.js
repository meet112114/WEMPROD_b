const mongoose = require('mongoose');

const ClientProfile = new mongoose.Schema({
    refId : {
        type: String,
        required: true,
        unique: true
    },
    name : {
        type : String,
        required : true
    },
    contactNo : {
        type: Number,
    },
    contactEmail : {
        type: String,
    },
    location : {
        type: String,
    },
    Bookings : [
        {
            bookingId : {
                type : String,
            }
           
        }
    ]

});


const ClientPro = mongoose.model('ClientPro', ClientProfile);

module.exports = ClientPro;