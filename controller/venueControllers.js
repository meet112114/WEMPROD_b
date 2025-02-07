const User = require("../models/user");
const VendorPro = require("../models/vendorProfile");
const Venue = require("../models/venue")
const Service = require("../models/service")

const addVenue = async (req, res) => {
  const user = req.userID;
  const isVendor = await VendorPro.findOne({ refId: user });

  if (isVendor) {
      const { name, venueType, venueDecs , basePrice, locationUrl, address } = req.body;
      const location = isVendor.location;
      // Fix: Handle tags properly
      const tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',');

      // Handle images
      const images = req.files?.['images'] ? req.files['images'].map(file => `/assets/images/${file.filename}`) : [];

      if (name && venueType && venueDecs && location && basePrice) {
          const venue = new Venue({
              vendorId: isVendor._id,
              vendorName: isVendor.name,
              name,
              venueType,
              venueDecs,
              locationUrl,
              address,
              location,
              basePrice,
              tags,
              images
          });

          await venue.save();

          await VendorPro.updateOne(
              { _id: isVendor._id },
              { $push: { venues: venue._id } }
          );

          res.status(200).json(venue);
      } else {
          res.status(400).json({ message: "Required data is not provided" });
      }
  } else {
      res.status(400).json({ message: "User must be a vendor to access this route" });
  }
};
           
   
const addServices = async (req, res) => {
  const user = req.userID;
  const isVendor = await VendorPro.findOne({ refId: user });
  const location = isVendor.location;

  if (isVendor) {
    const { name, description, plans, venues , serviceType} = req.body;

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
        serviceType,
        vendorId: isVendor._id,
        vendorName : isVendor.name,
        location,
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

  const getVendorsVenues = async (req ,res) => {

    const user = req.userID;
    const isVendor = await VendorPro.findOne({ refId: user });
    console.log(isVendor)
    if(isVendor){
      try{
        const data = await Venue.find({vendorId:isVendor._id})
        res.status(200).send(data)
      }catch(e){
        res.status(400).send("error",e)
      }
    }else{
      res.status(400).send("no vendor is logged in")
    }

  }

  const getVendorsServices = async (req , res) => {

    const user = req.userID;
    const isVendor = await VendorPro.findOne({ refId: user });
    console.log(isVendor)
    if(isVendor){
      try{
        const data = await Service.find({vendorId:isVendor._id})
        res.status(200).send(data)
      }catch(e){
        res.status(400).send("error",e)
      }
    }else{
      res.status(400).send("no vendor is logged in")
    }
  }

  const getVenueById = async (req,res) => {
    const { venueId } = req.params;
    if (venueId ) {
        try{
            const data = await Venue.findById(venueId)
            res.status(200).send(data)
        }catch(error){
          res.status(401).send(error)
        }
    }else{
      res.status(400).send("no id or isnt vendor")
    }
  }

  const getServiceById = async (req,res) => {
    const { serviceId } = req.params;
    if (serviceId ) {
      try{
          const data = await Service.findById(serviceId)
          res.status(200).send(data)
      }catch(error){
        res.status(401).send(error)
      }
  }else{
    res.status(400).send("no id or isnt vendor")
  }
  }

  const updateVenue = async (req, res) => {
    try {

        const { id, name, venueType, venueDecs, address, basePrice, locationUrl } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Venue ID is required" });
        }

        let venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        // Update basic fields
        venue.name = name;
        venue.venueType = venueType;
        venue.venueDecs = venueDecs;
        venue.address = address;
        venue.locationUrl = locationUrl;
        venue.basePrice = basePrice;

        // Handle tags (Ensure it's an array)
        venue.tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags);

        // Handle Removed Images
        if (req.body.removedImages) {
            const removedImages = JSON.parse(req.body.removedImages);
            venue.images = venue.images.filter(img => !removedImages.includes(img));

        }

        // Handle New Images
        if (req.files && req.files["images"]) {
            const newImages = req.files["images"].map(file => `/assets/images/${file.filename}`);
            venue.images.push(...newImages); // Append new images
        }

        // Save updated venue
        await venue.save();

        res.status(200).json({ message: "Venue updated successfully!", venue });

    } catch (error) {
        console.error("Error updating venue:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const updateService = async (req, res) => {


  const user = req.userID;
  const isVendor = await VendorPro.findOne({ refId: user });

  try {
    const { id, name, description, plans } = req.body;

    const parsedPlans = plans ? JSON.parse(plans) : [];


    const updatedPlans = parsedPlans.map(plan => {
      if (plan._id) {
        return { ...plan, _id: plan._id };
      } else {
        delete plan._id; 
        return plan;
      }
    });

    const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

    const images = req.files?.images
      ? req.files.images.map((file) => `/assets/images/${file.filename}`)
      : [];

    const service = await Service.findById(id);

    if (!service) return res.status(404).json({ message: "Service not found" });

    service.name = name;
    service.description = description;
    service.plans = updatedPlans;
    service.images = service.images.filter(img => !removedImages.includes(img)).concat(images);
    service.location = isVendor.location; 

    await service.save();

    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};


const getAllServices = async(req,res)=> {
  try{
    const data = await Service.find();
    res.send(data).status(200)
  }catch(error){
    res.status(400).send(error)
  }
}

module.exports = {addVenue,addServices,acceptService,rejectService, GetVenue , GetServicesByVenue ,getAllVenue ,getVendorsVenues , getVendorsServices , getVenueById , updateVenue , getServiceById , updateService , getAllServices}