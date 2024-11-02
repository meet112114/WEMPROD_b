const bcrypt = require('bcrypt');
const User = require('../models/user');
const UserPro = require('../models/userProfile')
const jwt = require('jsonwebtoken');




const googleRoute = async (req, res) => {
    if (req.user) {
      const email = req.user.emails[0].value;
      const name = req.user.displayName;
  
      try {
        let user = await User.findOne({ email });
  
        if (!user) {
          user = new User({ email, googleId, name });
          await user.save();
          console.log('User saved successfully.');
        } else if (user.password) {
          return res.status(400).json({ message: 'User email exists with normal registration' });
        } else {
        
        let token = jwt.sign({  email },process.env.SECRET_KEY, { expiresIn: '7d' });
        console.log('Generated Token:', token);
        
        res.cookie('jwtoken', token, {
          expires: new Date(Date.now() + 2589200000),
          httpOnly: true
        });
        return res.json({ message: "User login successful", token });
        }
  
      } catch (error) {
        console.error('Error handling user login:', error);
        res.status(500).json({ error: "An error occurred while processing the login" });
      }
    } else {
      res.status(400).json({ message: "Error logging in, try again later" });
    }
  };



const registerRoute = async (req, res) => {
    if (req.body) {
      const { email, name, password , accType } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        try {
          const newUser = new User({ email, password, name,accType });
          await newUser.save();
          console.log('User saved successfully.');
          res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
          console.error('Error saving user:', error);
          res.status(500).json({ error: 'An error occurred while registering the user' });
        }
      } else if (user.googleId) {
        res.status(400).json({ message: 'User email exists with Google login' });
      } else {
        res.status(400).json({ message: 'User email already registered' });
      }
    } else {
      res.status(400).json({ message: 'Request body is missing' });
    }
  };
  



  const loginRoute = async (req, res) => {
    const { email, password } = req.body;
    const userLogin = await User.findOne({ email });
  
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }else {
        let token = jwt.sign({  email: userLogin.email },process.env.SECRET_KEY, { expiresIn: '7d' });
        res.cookie('jwtoken', token, {
          expires: new Date(Date.now() + 2589200000),
          httpOnly: true
        });
         return res.json({ message: "User login successful", token });
      }

    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  };


  
const CreateProfile = async (req, res) => {
    if (req.body) {
      const { name, age, gender, height, weight } = req.body;
      const refId = req.userID;
  
      if (!refId || !name || !age || !gender) {
        return res.status(400).json({ error: "refId, name, age, and gender are required" });
      }
  
      try {
        const existingUserPro = await UserPro.findOne({ refId });
        if (existingUserPro) {
          return res.status(400).json({ error: "User profile with this refId already exists" });
        }
  
        const newUserPro = new UserPro({
          refId,
          name,
          age,
          gender,
          height,
          weight
        });
  
        await newUserPro.save();
        res.status(201).json(newUserPro);
      } catch (error) {
        res.status(500).json({ error: "An error occurred while creating the profile" });
      }
    } else {
      res.status(400).json({ error: "Request body is missing" });
    }
  };

module.exports = { googleRoute, registerRoute , loginRoute , CreateProfile };