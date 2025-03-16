const jwt = require("jsonwebtoken");
const User = require("../models/user");

const LoginAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken || req.headers.authorization?.split(" ")[1];

    console.log("Received Token:", token); // ✅ Debug token

    if (!token) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded Token:", decodedToken); // ✅ Debug decoded token

    const rootUser = await User.findOne({ email: decodedToken.email });
    if (!rootUser) {
      return res.status(401).send("Unauthorized: User not found");
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).send("Unauthorized: Invalid token");
  }
};

module.exports = LoginAuth;

