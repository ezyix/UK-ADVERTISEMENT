// backend/controllers/adController.js
const Ad = require('../models/Ad');
const User = require('../models/User');

// @route   POST /api/ads
// @desc    Create a new ad
// @access  Private (Requires login)
const createAd = async (req, res) => {
  try {
    const { title, category, price, description, images, tier } = req.body;
    const userId = req.user.id;

    // 1. Get the user to check their balances
    const user = await User.findById(userId);

    // 2. Check Free Ad eligibility
    if (tier === 'free') {
      if (user.freeAdsAvailable < 1) {
        return res.status(403).json({ message: 'You do not have any free ads available. Refer more friends!' });
      }
    }

    // 3. Calculate Expiration Date
    const expiresAt = new Date();
    if (tier === 'paid') {
      expiresAt.setDate(expiresAt.getDate() + 7); // Paid ads stay top for 7 days
    } else {
      expiresAt.setDate(expiresAt.getDate() + 14); // Free ads stay active for 14 days
    }

    // 4. Create the Ad
    const ad = await Ad.create({
      seller: userId,
      title,
      category,
      price,
      description,
      images, // For now, this will be an array of URL strings
      tier,
      expiresAt,
      status: 'active' // For paid ads, you would normally set 'pending_payment' until Stripe confirms it
    });

    // 5. Deduct the free ad from user's account if applicable
    if (tier === 'free') {
      user.freeAdsAvailable -= 1;
      await user.save();
    }

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ad', error: error.message });
  }
};

// @route   GET /api/ads
// @desc    Get all active ads (Filtered by search/category & Paginated)
// @access  Public
const getAds = async (req, res) => {
  try {
    const { keyword, category, page = 1, limit = 8 } = req.query; 
    let query = { status: 'active' };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by keyword
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    // Pagination calculations
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch the specific chunk of ads
    const ads = await Ad.find(query)
      .populate('seller', 'name whatsappNumber createdAt')
      .sort({ tier: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber); 
      
    // Get the total count of ads to know if there are more to load
    const totalAds = await Ad.countDocuments(query);
    const hasMore = totalAds > (skip + ads.length);

    // Notice we are now sending an object back instead of just the array!
    res.json({ 
      ads, 
      totalAds, 
      hasMore 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/ads/:id
// @desc    Get a single ad by ID
// @access  Public
const getSingleAd = async (req, res) => {
  try {
    // We use findByIdAndUpdate with $inc to add a view. 
    // This prevents crashes if old ads have outdated categories!
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true } // Return the updated document
    ).populate('seller', 'name whatsappNumber createdAt');
    
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    res.json(ad);
  } catch (error) {
    console.error("Error fetching single ad:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   GET /api/ads/myads
// @desc    Get logged-in user's ads (For Dashboard)
// @access  Private
const getMyAds = async (req, res) => {
  try {
    const ads = await Ad.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   DELETE /api/ads/:id
// @desc    Delete an ad (User can delete their own, Admin can delete any)
// @access  Private
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    // Check if user is the owner OR is an admin
    if (ad.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this ad' });
    }

    await ad.deleteOne();
    res.json({ message: 'Ad removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   PATCH /api/ads/:id/sold
// @desc    Toggle an ad's sold status
// @access  Private
const toggleSoldStatus = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    if (ad.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Toggle logic
    ad.status = ad.status === 'sold' ? 'active' : 'sold';
    await ad.save();
    
    res.json({ message: `Ad marked as ${ad.status}`, ad });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/ads/:id/report
// @desc    Report an ad
// @access  Private
const reportAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    // Check if the user already reported this ad
    if (ad.reports.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already reported this ad.' });
    }

    // Add user ID to the reports array
    ad.reports.push(req.user.id);
    await ad.save();

    res.json({ message: 'Ad reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   PUT /api/ads/:id
// @desc    Update an ad
// @access  Private
const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    // Check if user is the owner
    if (ad.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this ad' });
    }

    // Update fields
    ad.title = req.body.title || ad.title;
    ad.category = req.body.category || ad.category;
    ad.price = req.body.price || ad.price;
    ad.description = req.body.description || ad.description;
    
    // Only update images if new ones are provided
    if (req.body.images && req.body.images.length > 0) {
      ad.images = req.body.images;
    }

    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createAd, getAds, getSingleAd, getMyAds, deleteAd, toggleSoldStatus, updateAd, reportAd };