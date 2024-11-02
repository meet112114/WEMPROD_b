const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  accType: {
    type: String,
    default:"customer",
    enum: ['admin', 'vendor', 'customer'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  
});

userSchema.pre("save", async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified('googleId') && this.googleId) {
    this.googleId = await bcrypt.hash(this.googleId, 12);
  }
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;