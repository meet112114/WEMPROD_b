const mongoose = require("mongoose")

const ServicesSchema = new mongoose.Schema({
    name :{
        type: String,
        required : true
    },
    vendorId : {
        type: String,
        required : true
    },
    description :{
        type: String,
        required :true
    },
    images :{
        type: [String]
    },
    basePrice: {
        type:String,
        required: true
    },
    venueList: [
        {
            venueId:{
                type: String
            },
            status:{
                type:String,
                default:"false"
            }
        }
    ]
})

const Service = mongoose.model("Service" , ServicesSchema )
module.exports = Service