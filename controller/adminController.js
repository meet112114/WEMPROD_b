const User = require("../models/user");
const VendorPro = require("../models/vendorProfile");
const Venue = require("../models/venue");
const Service = require("../models/service");
const BookingsVen = require("../models/bookings");
const BookingsSer = require("../models/bookingser");

// Get all vendors
const getAllVendorsA = async (req, res) => {


    try {
        const vendors = await VendorPro.find();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vendors", error: error.message });
    }
};

// Get all users
const getAllUsersA = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// Get all venues
const getAllVenuesA = async (req, res) => {
    try {
        const venues = await Venue.find();
        res.status(200).json(venues);
    } catch (error) {
        res.status(500).json({ message: "Error fetching venues", error: error.message });
    }
};

// Get all services
const getAllServicesA = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Error fetching services", error: error.message });
    }
};

// Get all bookings
const getAllBookingsA = async (req, res) => {
    try {
        const venueBookings = await BookingsVen.find();
        const serviceBookings = await BookingsSer.find();
        res.status(200).json({ venueBookings, serviceBookings });
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
};

// Delete a venue
const deleteVenueA = async (req, res) => {
    try {
        const { venueId } = req.params;
        await Venue.findByIdAndDelete(venueId);
        res.status(200).json({ message: "Venue deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting venue", error: error.message });
    }
};

// Delete a service
const deleteServiceA = async (req, res) => {
    try {
        const { serviceId } = req.params;
        await Service.findByIdAndDelete(serviceId);
        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting service", error: error.message });
    }
};

// Accept venue function
const acceptVenue = async (req, res) => {
    try {
        const { venueId } = req.params;

        // Find and update the venue status to "accepted"
        const updatedVenue = await Venue.findByIdAndUpdate(
            venueId,
            { status: "accepted" },
            { new: true }
        );

        if (!updatedVenue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        res.status(200).json({ message: "Venue accepted successfully", venue: updatedVenue });
    } catch (error) {
        console.error("Error accepting venue:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const acceptServiceadmin = async(req,res) => {
    try {
        const { serviceId } = req.params;

        // Find and update the venue status to "accepted"
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { status: "accepted" },
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service accepted successfully", service: updatedService });
    } catch (error) {
        console.error("Error accepting service:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getAllVendorsA,
    getAllUsersA,
    getAllVenuesA,
    getAllServicesA,
    getAllBookingsA,
    deleteVenueA,
    deleteServiceA,
    acceptVenue,
    acceptServiceadmin
};
