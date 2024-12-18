const mongoose = require("mongoose")

const extServicesSchema = new mongoose.Schema({
    name :{
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
    }
})

const ExtService = mongoose.model("ExtService" , extServicesSchema )
module.exports = ExtService