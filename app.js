const dotenv = require("dotenv");
const express = require('express');
const session = require('express-session');
const passport = require('./router/passport'); 
const cors = require('cors');
dotenv.config({path:"./config.env"});
const path = require('path');

const app = express();
app.use(cors({
    origin: '*',  // Allow all origins (You can restrict it to your frontend IP)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
