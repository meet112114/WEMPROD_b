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
    },
    venueInquiry:[{
        venueId:{
            type:String
        },
        venueName:{
            type:String
        },
        userName:{
            type:String
        },
        contactNumber:{
            type:Number
        },
        contactEmail:{
            type:String
        },
        message:{
            type:String
        }
    }],
    serviceInquiry:[{
        serviceId:{
            type:String
        },
        serviceName:{
            type:String
        },
        userName:{
            type:String
        },
        contactNumber:{
            type:Number
        },
        contactEmail:{
            type:String
        },
        message:{
            type:String
        }
    }]

});


const VendorPro = mongoose.model('VendorPro', vendorProfile);

module.exports = VendorPro;