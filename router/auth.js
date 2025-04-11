const express = require('express');
const passport = require('./passport');
require('../database/connection');
const router = express.Router();
const cookieParser = require("cookie-parser");



const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)


//  importing controller functions  

const LoginAuth = require('../middleware/jwtmiddleware');
const { addBookingVen ,addBookingSer, getUserBookings , getUserSerBooing , getVendorBookings, getVendorBookingsServices  , checkout , stripeWebhookHandler , updateBookingStatus , acceptBookingAdmin} = require('../controller/bookingControllers')
const {  googleRoute, clintRegisterRoute , loginRoute , EditProfile, vendorRegisterRoute , getVendorProfile , addInquiryVenue , addInquiryService , deleteVenueInquiry , deleteServiceInquiry} = require('../controller/accountControllers');
const {addVenue , addServices,acceptService,rejectService,GetVenue ,GetServicesByVenue , getAllVenue ,getVendorsVenues , getVendorsServices , getVenueById , updateVenue , getServiceById , updateService,getAllServices , update} = require("../controller/venueControllers");
const {  getAllVendorsA,
  getAllUsersA,
  getAllVenuesA,
  getAllServicesA,
  getAllBookingsA,
  deleteVenueA,
  deleteServiceA,
  acceptVenue,
  acceptServiceadmin } = require('../controller/adminController')


const bodyParser = require('body-parser');
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), stripeWebhookHandler);



router.use(express.json());
router.use(cookieParser());

// multer config

const path = require('path');
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the original file extension
    const originalName = path.basename(file.originalname, ext); // Get the original file name without extension
    cb(null, `${originalName}-${uniqueSuffix}${ext}`); // Save file with original name and extension
  }
})

const upload = multer({ storage: storage })

const uploadFiles = upload.fields([
  { name: 'images', maxCount: 10 } // Multiple images field
]);

// google signin ( Oath2.0 ) routes 
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: '/login',
    successRedirect: '/google'
}));
router.get('/google', googleRoute);  // google signin/login route

// account register-login-edit
router.post('/register/client', clintRegisterRoute); // client signup route 
router.post('/login' , loginRoute);   // normal signin route
router.get('/get/vendor/profile',LoginAuth , getVendorProfile) // Get profile for Vendor
router.put('/profile/edit' , LoginAuth , EditProfile)   // create profile 
router.post('/register/vendor', vendorRegisterRoute) // vendor signup route 
router.post('/logout', (req, res) => {
  res.clearCookie('jwtoken', { path: '/' });
  res.status(200).json({ message: 'Logout successful' });
});


// venue - services related route
router.put('/abc', update);

router.post('/add/venue' , LoginAuth ,uploadFiles , addVenue) // adding new venues
router.post('/add/service', LoginAuth ,uploadFiles ,addServices ) // adding new services
router.post('/accept/service' , LoginAuth , acceptService)  // accepting services in a venue
router.post('/reject/service' , LoginAuth , rejectService)  // reject the service from vendors venue
router.get('/getAllVenue', getAllVenue)
router.get('/getAllService' , getAllServices)
router.get('/get/venue/:location' , GetVenue)
router.get('/get/serviceById/:venueId' , GetServicesByVenue)
router.get('/get/vendors/venues' , LoginAuth , getVendorsVenues)
router.get('/get/vendors/services' , LoginAuth , getVendorsServices)
router.get('/get/venueByID/:venueId',   getVenueById)
router.get('/get/servicesByID/:serviceId'  , getServiceById)
router.put('/edit/venue' , LoginAuth, uploadFiles , updateVenue)
router.put('/edit/service' , LoginAuth , uploadFiles , updateService)
router.post('/add/venue/inquiry' , addInquiryVenue)
router.post('/add/service/inquiry' , addInquiryService)
router.delete("/deleteVenueInquiry/:vendorId/:inquiryId", deleteVenueInquiry);
router.delete("/deleteServiceInquiry/:vendorId/:inquiryId", deleteServiceInquiry);

router.post("/add/booking/venue" , LoginAuth , addBookingVen);
router.post("/add/booking/service", LoginAuth ,addBookingSer)
router.get("/bookings/user/" , LoginAuth , getUserBookings);
router.get("/bookingsSer/user" , LoginAuth ,getUserSerBooing)

router.get("/bookings/vendor/" , LoginAuth , getVendorBookings);
router.get("/bookings/vendor/services" , LoginAuth ,getVendorBookingsServices)

router.put('/update/booking/status/:bookingId',LoginAuth , updateBookingStatus);
router.post('/checkout' , LoginAuth , checkout);

router.get('/admin/vendors', getAllVendorsA); // Get all registered vendors
router.get('/admin/users', getAllUsersA); // Get all registered users
router.get('/admin/venues', getAllVenuesA); // Get all venues
router.get('/admin/services', getAllServicesA); // Get all services
router.get('/admin/bookings', getAllBookingsA); // Get all bookings

router.delete('/admin/venue/:venueId', deleteVenueA); // Delete a venue by ID
router.delete('/admin/service/:serviceId', deleteServiceA); // Delete a service by ID

router.put("/admin/venue/accept/:venueId", acceptVenue);
router.put("/admin/service/accept/:serviceId", acceptServiceadmin);

router.put('/admin/update/booking/:bookingId' , acceptBookingAdmin);


module.exports = router;
