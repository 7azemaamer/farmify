import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set("strictQuery", false);

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
  connectTimeoutMS: 10000, // Give up initial connection after 10s
};

//Add connection string for mongodb deployment
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
