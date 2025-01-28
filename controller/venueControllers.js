const User = require("../models/user");
const VendorPro = require("../models/vendorProfile");
const Venue = require("../models/venue")
const Service = require("../models/service")


const addVenue = async(req,res) => {
    const user = req.userID;
    const isVendor = await VendorPro.findOne({refId : user})
    if(isVendor){
        const { name , venueType , venueDecs , location , basePrice , tags , locationUrl , address } = req.body;
        if(name && venueType && venueDecs && location && basePrice){

          
          const images = req.files['images'] ? req.files['images'].map(file => `/assets/images/${file.filename}`) : [];

            const venue= new Venue({ vendorId : isVendor._id ,  name , venueType , venueDecs , locationUrl , address,location , basePrice ,tags , images })
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
  const isVendor = await VendorPro.findOne({ refId: user });

  if (isVendor) {
    const { name, description, plans, venues } = req.body;

    try {
      // Parse JSON string fields
      const venuesArray = venues ? JSON.parse(venues) : [];
      const plansArray = plans ? JSON.parse(plans) : [];

      if (venuesArray.length === 0) {
        return res.status(400).json({ message: "Invalid or empty veneues array" });
      }

      if (!name || !description || plansArray.length === 0) {
        return res.status(400).json({ message: "Required data is missing" });
      }

      const images = req.files['images']
        ? req.files['images'].map((file) => `/assets/images/${file.filename}`)
        : [];

      const venueList = venuesArray.map((venueId) => ({ venueId }));

      const newService = new Service({
        name,
        vendorId: isVendor._id,
        description,
        plans: plansArray,
        images,
        venueList,
      });

      await newService.save();

      await VendorPro.updateOne(
        { _id: isVendor._id },
        {
          $push: {
            services: newService._id,
          },
        }
      );

      res.status(201).json({ message: "Service added successfully", newService });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error adding service", error: error.message });
    }
  } else {
    res.status(400).json({ message: "User must be a vendor to access this route" });
  }
};

  
  const acceptService = async(req ,res) => {

    const { venueId , serviceID }= req.body;

    const user = req.userID;
    const isVendor = await VendorPro.findOne({ refId: user });
    
    
    if (isVendor) {
      if (venueId && serviceID) {
        try {
          
          const service = await Service.findById(serviceID);
    
          if (!service) {
            return res.status(404).json({ message: "Service not found" });
          }
    
          const venue = service.venueList.find(v => v.venueId === venueId);
    
          if (!venue) {
            return res.status(404).json({ message: "Venue ID not found in the service" });
          }
    
          if (venue.status === "true") {
            return res.status(400).json({ message: "Venue has already been accepted" });
          }
    
          await Service.updateOne(
            { _id: serviceID, "venueList.venueId": venueId }, 
            { $set: { "venueList.$.status": "true" } } 
          );
    
          res.status(200).json({ message: "Service accepted successfully" });
        } catch (error) {
          

          console.error("Error updating service:", error.message);
          res.status(500).json({ message: "Internal server error", error: error.message });
        }
      } else {
        
        res.status(400).json({ message: "venueId and serviceID are required" });
      }
    } else {
      res.status(403).json({ message: " User is not a vendor" });
    }
    
  };

  const rejectService = async (req, res) => {
    const { venueId, serviceID } = req.body;
    const user = req.userID;
    const isVendor = await VendorPro.findOne({ refId: user });
  
    if (isVendor) {
      if (venueId && serviceID) {
        try {
          const service = await Service.findById(serviceID);
  
          if (!service) {
            return res.status(404).json({ message: "Service not found" });
          }
  
          const venue= service.venueList.find((v) => v.venueId === venueId);
  
          if (!venue) {
            return res.status(404).json({ message: "Venue ID not found in the service" });
          }
  
          await Service.updateOne(
            { _id: serviceID },
            { $pull: { venueList: { venueId } } } 
          );
  
          res.status(200).json({ message: "Venue removed successfully from the service" });
        } catch (error) {
          console.error("Error updating service:", error.message);
          res.status(500).json({ message: "Internal server error", error: error.message });
        }
      } else {
        res.status(400).json({ message: "veneueId and serviceID are required" });
      }
    } else {
      res.status(403).json({ message: "User is not a vendor" });
    }
  };

  const GetVenue= async(req , res) => {
    const { location } = req.params;

    if(location){
      try{
        const data = await Venue.find({location});
        res.status(200).send(data);
      }catch(e){
        res.status(400).json({e
        })
      }
    }else{
      res.status(400).json({message:"location is not available"})
    }
  }

  const GetServicesByVenue = async (req, res) => {
    const { venueId } = req.params;
    if (venueId) {
      try {

        const services = await Service.find({
          "venueList.venueId": venueId,
        });

     
        
        res.status(200).send(services);
      } catch (error) {
        console.error("Error fetching services:", error.message);
        res.status(400).json({ message: "Error fetching services", error: error.message });
      }
    } else {
      res.status(400).json({ message: "Venue ID is required" });
    }
  };
  
  const getAllVenue = async (req,res) => {
    const venues = await Venue.find();
    res.send(venues).status(200)
  }

module.exports = {addVenue,addServices,acceptService,rejectService, GetVenue , GetServicesByVenue ,getAllVenue}