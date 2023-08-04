const mongoose = require("mongoose");
const File = new mongoose.Schema({
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
    default: 0,
  },
  phone: {
    type: Number,
    required: false,
  },
  profile: {
    type: String,
    required: false,
  },
  
  resetToken: {
    type: String,
    required: false,
  },
  resetTokenExpiration: {
    type: String,
    required: false,
  },
 

});
module.exports = mongoose.model("Entry", File);
