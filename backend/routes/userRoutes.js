// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserDashboard, updateUserProfile, toggleWishlist, getWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// This route is protected! You must pass a valid token to see the dashboard.
router.get('/dashboard', protect, getUserDashboard);
router.put('/profile', protect, updateUserProfile);
router.post('/wishlist/:id', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;