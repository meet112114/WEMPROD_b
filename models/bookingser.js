const mongoose = require('mongoose');

const BookingsS = new mongoose.Schema({
    userId:{
     type:String,
     required:true
    },
    ServiceId:{
     type:String,
     required:true
    },
    planName:{
        type:String
    },
    planId:{
        type:String
    },
    ServiceName:{
     type:String
    },
    vendorId:{
     type:String
    },
    name:{
     type:String,
    },
    contactNo:{
     type:String,
    },
    date:{
     type:String,
     required:true
    },
    payment:{
         amount:{
             type:Number
         },
         status:{
             type:Boolean,
             default:false
         },
    },
    location:{
     type:String
    },
    eventType:{
     type:String
    },
    eventDesc:{
     type:String
    },
    adminStatus:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
       },
    bookingStatus:{
     type:String,
     enum:["pending","accepted","rejected"],
     default:"pending"
    }
 
 });

 const BookingSer = mongoose.model("BookingsS" , BookingsS);
 module.exports =   BookingSer ;