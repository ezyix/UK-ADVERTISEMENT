// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Import Routes
const adRoutes = require("./routes/adRoutes");
const userRoutes = require("./routes/userRoutes");

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the body

// API Routes
app.use("/api/ads", adRoutes); 
app.use("/api/users", userRoutes);

// Base Test Route
app.get("/", (req, res) => {
  res.send("UK-ADVERTISEMENT API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;