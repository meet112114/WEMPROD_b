const express = require('express');
const passport = require('./passport');
require('../database/connection');
const router = express.Router();
const cookieParser = require("cookie-parser");

router.use(express.json());
router.use(cookieParser());

//  importing controller functions  

const LoginAuth = require('../middleware/jwtmiddleware');
const {  googleRoute, clintRegisterRoute , loginRoute , EditProfile, vendorRegisterRoute , getVendorProfile , addInquiryVenue , addInquiryService} = require('../controller/accountControllers');
const {addVenue , addServices,acceptService,rejectService,GetVenue ,GetServicesByVenue , getAllVenue ,getVendorsVenues , getVendorsServices , getVenueById , updateVenue , getServiceById , updateService,getAllServices} = require("../controller/venueControllers");

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

///  




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

module.exports = router;