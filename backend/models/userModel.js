const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
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
  userid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: ""
  },
  phone: {
    type: Number,
    default: ""
  },
  password: {
    type: String,
    default: ""
  },
  tasks: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/150"
  }
}, {
  timestamps: true
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
