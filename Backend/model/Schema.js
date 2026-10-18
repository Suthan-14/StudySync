
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  googleId: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  profileImageData: {
    type: Buffer,
    default: null
  },
  profileImageContentType: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    default: "local"
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastLoginDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
