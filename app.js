const dotenv = require("dotenv");
const express = require('express');
const session = require('express-session');
const passport = require('./router/passport'); 
const cors = require('cors');
dotenv.config({path:"./config.env"});
const path = require('path');
const MongoStore = require('connect-mongo'); // Import connect-mongo
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const app = express();
app.use(cors({
    origin: '*',  // Allow all origins (You can restrict it to your frontend IP)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
            mongoUrl: process.env.DATABASE, 
            collectionName: 'sessions', 
            mongoOptions: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./router/auth'));

app.use('/assets/images', express.static(path.join(__dirname, './assets/images')));
app.use('/assets/outfit', express.static(path.join(__dirname, './assets/outfit')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running at port number ${PORT}`);
});