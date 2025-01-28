const bcrypt = require("bcrypt");
const User = require("../models/user");
const ClientPro = require("../models/clientProfile");
const VendorPro = require("../models/vendorProfile");
const jwt = require("jsonwebtoken");

const googleRoute = async (req, res) => {
  if (req.user) {
    const email = req.user.emails[0].value;
    const name = req.user.displayName;
    const googleId = req.user.id;
    console.log(googleId);
    try {
      let user = await User.findOne({ email });
      let accType = "client";
      if (!user) {
        user = new User({ email, googleId, name ,accType });
        await user.save();
        const clientProfile = new ClientPro({ refId: user._id, name });
        await clientProfile.save();
        console.log("User saved successfully.");
        
        let token = jwt.sign({ email }, process.env.SECRET_KEY, {
          expiresIn: "7d",
        });
        console.log("Generated Token:", token);

        res.cookie("jwtoken", token, {
          expires: new Date(Date.now() + 2589200000),
          httpOnly: true,
        });

        res.redirect('http://localhost:5173/google');

      } else if (user.password) {
        return res
          .status(400)
          .json({ message: "User email exists with normal registration" });
      } else {
        let token = jwt.sign({ email }, process.env.SECRET_KEY, {
          expiresIn: "7d",
        });
        console.log("Generated Token:", token);

        res.cookie("jwtoken", token, {
          expires: new Date(Date.now() + 2589200000),
          httpOnly: true,
        });
        
        res.redirect('http://localhost:5173/google');
      }
    } catch (error) {
      console.error("Error handling user login:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the login" });
    }
  } else {
    res.status(400).json({ message: "Error logging in, try again later" });
  }
};

const clintRegisterRoute = async (req, res) => {
  if (req.body) {
    const { email, name, password, accType } = req.body;
    if (accType === "client") {
      const user = await User.findOne({ email });
      if (!user) {
        try {
          const newUser = new User({ email, password, name, accType });
          console.log(newUser);
          await newUser.save();
          const clientProfile = new ClientPro({ refId: newUser._id, name });
          console.log(clientProfile);
          await clientProfile.save();
          console.log("User saved successfully.");
          res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
          console.error("Error saving user:", error);
          res
            .status(500)
            .json({ error: "An error occurred while registering the user" });
        }
      } else if (user.googleId) {
        res
          .status(400)
          .json({ message: "User email exists with Google login" });
      } else {
        res.status(400).json({ message: "User email already registered" });
      }
    } else {
      res.status(400).json({ message: "accType must be client" });
    }
  } else {
    res.status(400).json({ message: "Request body is missing" });
  }
};

const vendorRegisterRoute = async (req, res) => {
  if (req.body) {
    const {
      accType,
      name,
      email,
      password,
      contactNo,
      contactEmail,
      location,
      GstNo,
    } = req.body;
    if (accType === "vendor") {
      if (
        accType &&
        name &&
        email &&
        password &&
        contactNo &&
        contactEmail &&
        location &&
        GstNo
      ) {
        const user = await User.findOne({ email });
        if (!user) {
          try {
            const newuser = new User({ email, password, name, accType });
            newuser.save();
            const vendorProfile = new VendorPro({
              refId: newuser._id,
              name,
              contactNo,
              contactEmail,
              location,
              GstNo,
            });
            vendorProfile.save();
            console.log("User saved successfully.");
            res.status(201).json({ message: "User registered successfully" });
          } catch (error) {
            console.error("Error saving user:", error);
            res
              .status(500)
              .json({ error: "An error occurred while registering the user" });
          }
        } else if (user.googleId) {
          res
            .status(500)
            .json({ message: "User email is registered with Google" });
        } else {
          res.status(500).json({ message: "User email already registered" });
        }
      } else {
        res.status(400).json({ message: "Data required is not provided " });
      }
    } else {
      res.status(400).json({ message: "accType must be vendor" });
    }
  } else {
    res.status(400).json({ message: "Request body is missing" });
  }
};

const loginRoute = async (req, res) => {
  try {
    const { email, password, accType } = req.body;

    if (!email || !password || !accType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userLogin = await User.findOne({ email });
    if (!userLogin) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userLogin.accType !== accType) {
      return res.status(403).json({ error: "Account type mismatch" });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ email: userLogin.email }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 2589200000), // About 30 days
      httpOnly: true,
    });

    return res.status(200).json({ message: "User login successful", token });
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const EditProfile = async (req, res) => {
  if (req.body) {
    const { name, contactNo, contactEmail, location } = req.body;
    const refId = req.userID;

    if (!refId) {
      return res.status(400).json({ error: "refId" });
    }

    try {
      const updatedUserPro = await ClientPro.findOneAndUpdate(
        { refId },
        { name, contactNo, contactEmail, location },
        { new: true, upsert: true }
      );

      if (updatedUserPro) {
        res.status(200).json(updatedUserPro);
      } else {
        res.status(400).json({ error: "Error updating profile" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while creating the profile" });
    }
  } else {
    res.status(400).json({ error: "Request body is missing" });
  }
};

const getVendorProfile = async (req,res) => {
  const refId = req.userID;
  if(refId){
    const vendorProfile = await VendorPro.findOne({refId})
    res.send(vendorProfile);
  }else{
    res.status(400).json({message:"no id found"})
  }
}

module.exports = {
  googleRoute,
  clintRegisterRoute,
  loginRoute,
  EditProfile,
  vendorRegisterRoute,
  getVendorProfile
};
