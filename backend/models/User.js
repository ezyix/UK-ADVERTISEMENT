// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // We will hash this later
    whatsappNumber: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Referral System Logic
    referralCode: { type: String, unique: true }, 
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
    referralCount: { type: Number, default: 0 }, 
    freeAdsAvailable: { type: Number, default: 0 }, 
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
  },
  { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

module.exports = mongoose.model('User', userSchema);