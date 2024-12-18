const express = require('express');
const passport = require('./passport');
require('../database/connection');
const router = express.Router();
const cookieParser = require("cookie-parser");

router.use(express.json());
router.use(cookieParser());

const LoginAuth = require('../middleware/jwtmiddleware');
const {  googleRoute, clintRegisterRoute , loginRoute , EditProfile, vendorRegisterRoute } = require('../controller/accountControllers');
const {addVenue , addServices} = require("../controller/venueControllers");

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
router.post('/register/client', clintRegisterRoute); // client signup route 
router.post('/login' , loginRoute);   // normal signin route
router.put('/profile/edit' , LoginAuth , EditProfile)   // create profile 
router.post('/register/vendor', vendorRegisterRoute) // vendor signup route 


router.post('/add/venue' , LoginAuth ,uploadFiles , addVenue) // adding new venues
router.post('/add/service', LoginAuth ,uploadFiles ,xaddServices ) // adding new services

module.exports = router;