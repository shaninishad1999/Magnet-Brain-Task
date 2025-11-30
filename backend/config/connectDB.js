const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Mongo URI: ", process.env.MONGO_URI); // Debugging line to see the URI
    const conn = await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
