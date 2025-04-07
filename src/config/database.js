import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set("strictQuery", false);

//Add connection string for mongodb deployment
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
