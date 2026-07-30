// backend/models/Ad.js
const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Vehicles', 'Jobs', 'Shops', 'Startups', 'Tech', 'Items', 'Fashion', 'Hobbies'], 
      required: true 
    },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Will hold Cloudinary/AWS image URLs
    
    // Business Logic
    tier: { type: String, enum: ['free', 'paid'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'deleted', 'sold'], default: 'active' },
    views: { type: Number, default: 0 },
    
    // Expiration Logic
    expiresAt: { type: Date, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);