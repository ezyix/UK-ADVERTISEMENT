// backend/routes/adRoutes.js
const express = require('express');
const router = express.Router();
const { createAd, getAds, getSingleAd, getMyAds, deleteAd, markAsSold, updateAd } = require('../controllers/adController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes (Anyone can view ads)
router.get('/', getAds);
router.get('/:id', getSingleAd);

// Private Routes (Must be logged in)
// IMPORTANT: We place /myads above /:id so Express doesn't confuse "myads" for an ID!
router.get('/user/myads', protect, getMyAds); 
router.post('/', protect, createAd);
router.put('/:id', protect, updateAd);
router.delete('/:id', protect, deleteAd);
router.patch('/:id/sold', protect, markAsSold);
module.exports = router;