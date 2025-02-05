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
            type:String,
            required:true
        },
        userName:{
            type:String,
            required:true
        },
        contactNumber:{
            type:Number,
            required:true
        },
        contactEmail:{
            type:String,
            required:true
        },
        message:{
            type:String,
            required:true
        }
    }],
    serviceInquiry:[{
        serviceId:{
            type:String,
            required:true
        },
        userName:{
            type:String,
            required:true
        },
        contactNumber:{
            type:Number,
            required:true
        },
        contactEmail:{
            type:String,
            required:true
        },
        message:{
            type:String,
            required:true
        }
    }]

});


const VendorPro = mongoose.model('VendorPro', vendorProfile);

module.exports = VendorPro;