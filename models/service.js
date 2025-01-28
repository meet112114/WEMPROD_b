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
    ],
    plans: [
        {
          planName: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ]
})

const Service = mongoose.model("Service" , ServicesSchema )
module.exports = Service