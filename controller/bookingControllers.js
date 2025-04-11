const BookingVen = require('../models/bookings');
const BookingSer = require('../models/bookingser');
const VendorPro = require("../models/vendorProfile");

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)


const addBookingVen = async (req, res) => {
    const { name ,venueId, venueName , contactNo ,vendorId, date, amount, location, eventType, eventDesc } = req.body;
    const userId = req.userID; 
    if (!userId || !venueId || !date || !amount || !eventType || !eventDesc) {
        return res.status(400).json({ message: "Required Data not available" });
    }

    try {
        const newBooking = new BookingVen({
          name,
          contactNo,
            userId,
            venueId,
            venueName,
            vendorId,
            date,
            payment: { amount, status: false },
            location,
            eventType,
            eventDesc
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking successfully created", booking: newBooking });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const addBookingSer = async (req, res) => {
  // Destructure the required fields from the request body
  const {
    planName,
    planId,
    name,
    ServiceId,
    ServiceName,
    contactNo,
    vendorId,
    date,
    amount,
    location,
    eventType,
    eventDesc
  } = req.body;

  // Get the user ID from the authenticated request (assumed to be set by your auth middleware)
  const userId = req.userID;

  // Validate required fields; adjust validation as needed for your project
  if (!userId || !ServiceId || !date || !amount || !eventType || !eventDesc) {
    return res.status(400).json({ message: "Required Data not available" });
  }

  try {
    // Create a new booking document for the service
    const newBooking = new BookingSer({
      planId,
      planName,
      name,
      contactNo,
      userId,
      ServiceId,
      ServiceName,
      vendorId,
      date,
      payment: { amount, status: false }, // Payment status false until paid
      location,
      eventType,
      eventDesc
    });

    // Save the new booking to the database
    await newBooking.save();

    // Return a success response with the new booking data
    res.status(201).json({ message: "Booking successfully created", booking: newBooking });
  } catch (err) {
    // Log and return server error details
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




const getUserBookings = async(req,res) => {
    const userId = req.userID; 
    try {
        const bookings = await BookingVen.find({ userId });
        res.json(bookings);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings" });
      }
}

const getUserSerBooing = async(req,res) => {
  const userId = req.userID; 
  try {
      const bookings = await BookingSer.find({ userId });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }


  const getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.userID;

        // Find the VendorPro document where refId matches vendorId
        const vendorPro = await VendorPro.findOne({ refId: vendorId });

        if (!vendorPro) {
            return res.status(404).json({ error: "Vendor profile not found" });
        }

        const bookings = await BookingVen.find({ vendorId: vendorPro._id });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching vendor bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};

const getVendorBookingsServices = async(req,res) => {
  try {
    const vendorId = req.userID;

    // Find the VendorPro document where refId matches vendorId
    const vendorPro = await VendorPro.findOne({ refId: vendorId });

    if (!vendorPro) {
        return res.status(404).json({ error: "Vendor profile not found" });
    }

    const bookings = await BookingSer.find({ vendorId: vendorPro._id });

    res.json(bookings);
} catch (error) {
    console.error("Error fetching vendor bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
}
}


  const checkout =  async (req, res) => {
    try {
      console.log("Received request:", req.body); // Debugging

      const { bookingDetails, baseUrl } = req.body;

      // Validate request body
      if (!bookingDetails || !bookingDetails.productId || !bookingDetails.vendorId) {
          return res.status(400).json({ error: "Invalid booking details" });
      }

      // Stripe requires amount in smallest currency unit (e.g., paise for INR)
      const amount = bookingDetails.price * 100; // Convert INR to paise

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
              {
                  price_data: {
                      currency: bookingDetails.currency.toLowerCase(),
                      product_data: { name: "Your Booking" },
                      unit_amount: amount,
                  },
                  quantity: 1,
              },
          ],
          metadata: {
                bookingId: bookingDetails.bookingId.toString(),
              },
          mode: "payment",
          success_url: `${baseUrl}/bookings`,
          cancel_url: `${baseUrl}/cancel`,
      });

      res.json({ url: session.url });
  } catch (error) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ error: "Server error during checkout" });
  }
};


const stripeWebhookHandler = async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      // Try to update BookingVen first
      const venueBooking = await BookingVen.findByIdAndUpdate(bookingId, {
        $set: { 'payment.status': true },
      });

      if (venueBooking) {
        console.log(`✅ Venue Booking ${bookingId} marked as paid`);
      } else {
        // If not found in Venue, try in Service
        const serviceBooking = await BookingSer.findByIdAndUpdate(bookingId, {
          $set: { 'payment.status': true },
        });

        if (serviceBooking) {
          console.log(`✅ Service Booking ${bookingId} marked as paid`);
        } else {
          console.warn(`❌ No booking found with ID: ${bookingId}`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};





const updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body; // Accept or Reject

  try {
    // Validate status
    if (!["accepted", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    let updatedBooking = await BookingVen.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true }
    );

    if (!updatedBooking) {
      updatedBooking = await BookingSer.findByIdAndUpdate(
        bookingId,
        { bookingStatus: status },
        { new: true }
      );
    }

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({
      message: `Booking ${status} successfully.`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const acceptBookingAdmin = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body; // "accepted" or "rejected"

  try {
    // Validate status
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    // Find booking in either collection and update it
    let booking = await BookingVen.findOneAndUpdate(
      { _id: bookingId },
      { adminStatus: status },
      { new: true }
    );

    if (!booking) {
      booking = await BookingSer.findOneAndUpdate(
        { _id: bookingId },
        { adminStatus: status },
        { new: true }
      );
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: `Booking ${status} by admin`,
      booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


module.exports = { addBookingVen , getUserBookings ,getVendorBookings  , checkout ,stripeWebhookHandler , addBookingSer , getUserSerBooing , getVendorBookingsServices , updateBookingStatus , acceptBookingAdmin};
