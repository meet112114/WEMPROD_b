const jwt = require('jsonwebtoken');
const User = require('../models/user');

const LoginAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']; // Get the Authorization header
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: No authorization header' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token from the 'Bearer <token>' format
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
   
    const decodedToken = jwt.verify(token , process.env.SECRET_KEY);
    const rootUser = await User.findOne({ email : decodedToken.email });

    if (!rootUser) {
      return res.status(401).send('Unauthorized: User not found');
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next();
  } catch (err) {
    res.status(401).send('Unauthorized: No valid token found');
    console.log(err);
  }
};

module.exports = LoginAuth;
