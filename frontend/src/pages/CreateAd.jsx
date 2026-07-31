// frontend/src/pages/CreateAd.jsx
import { useState, useEffect, useContext, useRef } from 'react';
import { CheckCircle2, Copy, Info, ShieldCheck, Camera, X, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const categories = ['Vehicles', 'Jobs', 'Services', 'Electronics & Appliances', 'Furniture', 'Properties', 'Mobiles', 'Others'];

const CreateAd = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
  });
  
  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/users/dashboard', config);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching user data', error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle local file selection and create a preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Creates a fast local preview
      setError('');
    }
  };

// Add this logic to determine what is optional based on the selected category
  const isPriceOptional = ['Jobs', 'Services', 'Others'].includes(formData.category);
  const isImageOptional = ['Jobs', 'Services', 'Others'].includes(formData.category);

  // Upload to Cloudinary Function (With better error handling)
  const uploadImageToCloudinary = async () => {
    try {
      const data = new FormData();
      data.append('file', imageFile);
      data.append('upload_preset', 'localmarket_preset'); // Keep your preset
      data.append('cloud_name', 'dj4t5exhg'); // Keep your cloud name

      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dj4t5exhg/image/upload', 
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err);
      throw new Error("Image upload failed. Please check your internet connection or turn off ad-blockers.");
    }
  };

const handleSubmit = async (tier) => {
    // 1. Check basic required fields
    if (!formData.title || !formData.category || !formData.description) {
      setError('Please fill in all required text fields.');
      return;
    }

    // 2. Check conditional required fields
    if (!isPriceOptional && !formData.price) {
      setError(`Price is required for the ${formData.category} category.`);
      return;
    }
    if (!isImageOptional && !imageFile) {
      setError(`An image is required for the ${formData.category} category.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let finalImagesArray = [];
      
      // If user selected an image, try to upload it
      if (imageFile) {
        const uploadedUrl = await uploadImageToCloudinary();
        finalImagesArray.push(uploadedUrl);
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const adData = {
        ...formData,
        price: formData.price ? Number(formData.price) : 0, // Default to 0 if optional
        images: finalImagesArray, // Will be empty [] if no image uploaded
        tier
      };

      await axios.post('/api/ads', adData, config);
      navigate('/dashboard'); 
    } catch (err) {
      // This will now catch the Cloudinary network error gracefully!
      setError(err.message || err.response?.data?.message || 'Failed to create ad');
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const referralUrl = `${window.location.origin}/auth?ref=${dashboardData?.referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (dataLoading || !dashboardData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>;
  }

  const freeAdsAvailable = dashboardData.freeAdsAvailable;
  const isFreeAdLocked = freeAdsAvailable < 1;
  const referralsCompleted = dashboardData.referralCount;
  const referralsNeeded = 5;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto flex flex-col min-h-screen pb-10">
      
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-500 text-sm">Fill in the details to reach local buyers in your community.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-medium text-sm flex items-center gap-2">
          <Info className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        
        {/* FORM SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8">
          <div className="space-y-5">
            
            {/* Ad Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ad Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="What are you selling?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1 focus:ring-whatsapp transition-colors" />
            </div>

            {/* Category & Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1 focus:ring-whatsapp transition-colors appearance-none">
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price (₹) {!isPriceOptional && '*'}
                  {isPriceOptional && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
                </label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1 focus:ring-whatsapp transition-colors" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe the item, condition, and any special terms..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1 focus:ring-whatsapp transition-colors resize-none"></textarea>
            </div>

            {/* Product Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Photo {!isImageOptional && '*'}
              {isImageOptional && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
              </label>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp"
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
              />

              {/* Upload Box OR Preview Box */}
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current.click()} 
                  className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-100 hover:border-whatsapp transition-colors cursor-pointer group"
                >
                  <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:bg-whatsapp group-hover:text-white text-whatsapp transition-colors">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Click to upload photo</p>
                  <p className="text-sm text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              ) : (
                <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        fileInputRef.current.value = null;
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition"
                    >
                      <X className="w-5 h-5" /> Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* VISIBILITY / PRICING SECTION */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Visibility</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Standard (Free) Card */}
            <div className={`bg-white rounded-2xl border-2 p-5 md:p-6 flex flex-col relative ${isFreeAdLocked ? 'border-gray-200' : 'border-whatsapp shadow-lg shadow-green-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg">Standard Ad (Free)</h3>
                <Info className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-6">Stays live for 14 days, standard visibility.</p>
              
              {isFreeAdLocked ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-600 uppercase">Referral Unlock</span>
                    <span className="text-whatsapp">{referralsCompleted} / {referralsNeeded} completed</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                    <div className="bg-whatsapp h-full rounded-full" style={{ width: `${(referralsCompleted / referralsNeeded) * 100}%` }}></div>
                  </div>
                  <button onClick={handleCopyLink} className="w-full flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-whatsapp" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to clipboard!' : 'Copy Referral Link'}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 text-green-800 p-3 rounded-xl text-sm mb-5 font-bold border border-green-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-whatsapp" />
                  You have {freeAdsAvailable} Free Ad(s) available!
                </div>
              )}

              <button 
                onClick={() => handleSubmit('free')}
                disabled={isFreeAdLocked || isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-lg mt-auto transition-all flex justify-center items-center gap-2 ${isFreeAdLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-black'}`}
              >
                {isSubmitting ? <><Loader className="w-5 h-5 animate-spin" /> Uploading...</> : 'Publish Free'}
              </button>
            </div>

            {/* Featured (Paid) Card */}
            <div className="bg-[#f2fdf5] rounded-2xl border-2 border-whatsapp p-5 md:p-6 flex flex-col relative shadow-lg shadow-green-100/50">
              <div className="absolute -top-3 right-4 bg-whatsapp text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">Best Value</div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-2">Featured Ad (Paid - ₹29)</h3>
              <p className="text-sm text-gray-600 mb-6">Stays pinned to the top for 7 days, 5x more views.</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-5 h-5 text-whatsapp" /> Premium badge on listing</li>
                <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-5 h-5 text-whatsapp" /> Pinned to top of category</li>
              </ul>

              <button 
                onClick={() => handleSubmit('paid')}
                disabled={isSubmitting}
                className="w-full bg-whatsapp text-white hover:bg-whatsappDark py-3.5 rounded-xl font-bold text-lg mt-auto shadow-md shadow-green-200 transition-colors disabled:bg-green-300 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <><Loader className="w-5 h-5 animate-spin" /> Uploading...</> : 'Pay & Publish'}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};

export default CreateAd;
