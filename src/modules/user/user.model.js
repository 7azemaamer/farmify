import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true }, // Unique but optional
  password: { type: String }, // For traditional login
  googleId: { type: String, unique: true, sparse: true }, // Unique but optional
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;