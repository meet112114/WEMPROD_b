const mongoose = require('mongoose');

const vendorProfile = new mongoose.Schema({
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
        type: String,
        required : true
    },
    contactEmail : {
        type: String,
        required : true
    },
    location : {
        type: String,
        required : true
    },
    GstNo : {
        type: String,
        required : true
    },
    venues : {
        type: [String], 
    },
    services : {
        type: [String], 
    }

});


const VendorPro = mongoose.model('VendorPro', vendorProfile);

module.exports = VendorPro;