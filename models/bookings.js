const mongoose = require('mongoose');

const BookingsV = new mongoose.Schema({
   userId:{
    type:String,
    required:true
   },
   venueId:{
    type:String,
    required:true
   },
   venueName:{
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


 


const BookingVen = mongoose.model('BookingsV', BookingsV);


module.exports = BookingVen ;