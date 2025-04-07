import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// MongoDB connection options
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_URI ? "Present" : "Missing"
    );

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    const connection = mongoose.connection;
    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });
  } catch (error) {
    console.error("MongoDB connection error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      reason: error.reason,
    });

    if (process.env.NODE_ENV === "development") {
      process.exit(1);
    }
  }
};

export default connectDB;
