// backend/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, whatsappNumber, referralCodeInput } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate a unique referral code for the NEW user (e.g., ALEX-8F2A)
    const myReferralCode = name.split(' ')[0].toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // 4. Handle Referral Logic (If they signed up using someone else's link)
    let referredById = null;
    if (referralCodeInput) {
      const referrer = await User.findOne({ referralCode: referralCodeInput });
      if (referrer) {
        referredById = referrer._id;
        
        // Add +1 to the referrer's count
        referrer.referralCount += 1;
        
        // If they hit 5, unlock a free ad and reset count
        if (referrer.referralCount >= 5) {
          referrer.freeAdsAvailable += 1;
          referrer.referralCount = 0;
        }
        await referrer.save(); // Save the updated referrer
      }
    }

    // 5. Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      whatsappNumber,
      referralCode: myReferralCode,
      referredBy: referredById
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   GET /api/users/dashboard
// @desc    Get user data (referral progress, free ads available)
const getUserDashboard = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.whatsappNumber = req.body.whatsappNumber || user.whatsappNumber;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        whatsappNumber: updatedUser.whatsappNumber,
        role: updatedUser.role,
        token: req.headers.authorization.split(' ')[1] // Send the same token back
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/users/wishlist/:id
// @desc    Add or remove an ad from wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const adId = req.params.id;

    // Check if ad is already in wishlist
    if (user.wishlist.includes(adId)) {
      user.wishlist.pull(adId); // Remove it
    } else {
      user.wishlist.push(adId); // Add it
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist ads
// @access  Private
const getWishlist = async (req, res) => {
  try {
    // Fetch the user and populate the actual Ad data from the saved IDs
    const user = await User.findById(req.user.id).populate('wishlist');
    
    // Filter out any ads that might have been deleted by the seller/admin
    const activeWishlistAds = user.wishlist.filter(ad => ad !== null);
    
    res.json(activeWishlistAds);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update the exports at the bottom!
module.exports = { registerUser, loginUser, getUserDashboard, updateUserProfile, toggleWishlist, getWishlist };