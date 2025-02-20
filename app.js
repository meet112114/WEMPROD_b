const dotenv = require("dotenv");
const express = require('express');
const session = require('express-session');
const passport = require('./router/passport'); 
const cors = require('cors');
dotenv.config({path:"./config.env"});
const path = require('path');

const app = express();

const allowedOrigins = [
  'http://localhost:3000', 
  'https://wemprod-b.onrender.com',
  'https://wemprod-f.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from allowed origins or no origin (like Postman)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // This must be true to allow cookies and credentials
};

app.use(cors(corsOptions));


app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./router/auth'));

app.use('/assets/images', express.static(path.join(__dirname, './assets/images')));
app.use('/assets/outfit', express.static(path.join(__dirname, './assets/outfit')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
