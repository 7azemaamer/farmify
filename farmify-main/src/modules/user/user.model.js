// To Do: Search about methods, pre() in mongoose
// Add whatever you need

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  password: { type: String, required: true },
  otp:{ type : String},
  otpExpires :{type:Date},
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
});

const User = mongoose.model("User", userSchema)
export default User;
