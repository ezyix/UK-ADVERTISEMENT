// backend/models/Ad.js
const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    
    // UPDATED: New Categories List
    category: { 
      type: String, 
      enum: ['Vehicles', 'Jobs', 'Services', 'Electronics & Appliances', 'Furniture', 'Properties', 'Mobiles', 'Others'], 
      required: true 
    },
    
    // UPDATED: Price is now optional (defaults to 0)
    price: { type: Number, default: 0 },
    
    description: { type: String, required: true },
    images: [{ type: String }],
    
    tier: { type: String, enum: ['free', 'paid'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'deleted', 'sold'], default: 'active' },
    
    // ADDED: For the Report Ad feature
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    views: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);