const User = require("../models/user");
const VendorPro = require("../models/vendorProfile");
const Venue = require("../models/venue")
const Service = require("../models/service")


const addVenue = async(req,res) => {
    const user = req.userID;
    const isVendor = await VendorPro.findOne({refId : user})
    if(isVendor){
        const { name , venueType , venueDecs , location , basePrice , tags } = req.body;
        if(name && venueType && venueDecs && location && basePrice){

          
          const images = req.files['images'] ? req.files['images'].map(file => `/assets/images/${file.filename}`) : [];

            const venue = new Venue({ vendorId : isVendor._id ,  name , venueType , venueDecs , location , basePrice ,tags , images })
            await venue.save();
            

            const updatedVendorPro = await VendorPro.updateOne(
                { _id: isVendor._id }, 
                {
                    $push: {
                        venues: venue._id, 
                    }
                }
            );

            res.status(200).send(venue)

        }else{
            res.status(400).json({message : "Required Data is not provided"})
        }
    }else{
        res.status(400).json({message : "user must be vendor tro access this route"})
    }
}


const addServices = async (req, res) => {
    const user = req.userID;
    console.log(user);
    const isVendor = await VendorPro.findOne({ refId: user });
  
    if (isVendor) {
      const { name, description, basePrice,  veneues } = req.body;
      
      const veneuesArray = Array.isArray(veneues) ? veneues : [];

      if (name && description && veneues && basePrice) {
        try {

          const images = req.files['images'] ? req.files['images'].map(file => `/assets/images/${file.filename}`) : [];
          
          const venueList = veneuesArray.map(venueId => ({ venueId }));
          
          const newService = new Service({
            name,
            vendorId: isVendor._id , 
            description,
            basePrice ,

            images,
            venueList
          });

          await newService.save();

          const updatedVendorPro = await VendorPro.updateOne(
            { _id: isVendor._id }, 
            {
                $push: {
                    services: newService._id, 
                }
            }
            
        );

          res.status(201).json({ message: "Service added successfully", newService });
        } catch (error) {
          res.status(500).json({ message: "Error adding service", error: error.message });
        }
      } else {
        res.status(400).json({ message: "Required Data is not provided" });
      }
    } else {
      res.status(400).json({ message: "User must be a vendor to access this route" });
    }
  };

  


module.exports = {addVenue,addServices}