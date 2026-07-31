// frontend/src/pages/EditAd.jsx
import { useState, useEffect, useContext, useRef } from 'react';
import { Camera, X, Loader, ArrowLeft, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

// 1. UPDATED CATEGORIES
const categories = ['Vehicles', 'Jobs', 'Services', 'Electronics & Appliances', 'Furniture', 'Properties', 'Mobiles', 'Others'];

const EditAd = () => {
  const { id } = useParams(); 
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 2. OPTIONAL LOGIC (Jobs, Services, Others)
  const isPriceOptional = ['Jobs', 'Services', 'Others'].includes(formData.category);
  const isImageOptional = ['Jobs', 'Services', 'Others'].includes(formData.category);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchAd = async () => {
      try {
        const { data } = await axios.get(`/api/ads/${id}`);
        
        if (data.seller._id !== user._id) {
          navigate('/dashboard');
          return;
        }

        setFormData({
          title: data.title,
          category: data.category,
          // If price is 0 (optional), show empty string so it doesn't look weird
          price: data.price === 0 ? '' : data.price,
          description: data.description,
        });
        
        if (data.images && data.images.length > 0) {
          setImagePreview(data.images[0]);
        }
      } catch (err) {
        setError('Failed to load ad details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // 3. SAFE CLOUDINARY UPLOAD
  const uploadImageToCloudinary = async () => {
    try {
      const data = new FormData();
      data.append('file', imageFile);
      data.append('upload_preset', 'localmarket_preset'); 
      data.append('cloud_name', 'dj4t5exhg'); 

      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dj4t5exhg/image/upload', 
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err);
      throw new Error("Image upload failed. Please check your internet connection.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION
    if (!formData.title || !formData.category || !formData.description) {
      setError('Please fill in all required text fields.');
      return;
    }
    if (!isPriceOptional && !formData.price) {
      setError(`Price is required for the ${formData.category} category.`);
      return;
    }
    if (!isImageOptional && !imagePreview && !imageFile) {
      setError(`An image is required for the ${formData.category} category.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let finalImageUrl = null;
      
      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary();
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const updateData = {
        ...formData,
        price: formData.price ? Number(formData.price) : 0, // Default to 0 if empty
      };

      if (finalImageUrl) {
        updateData.images = [finalImageUrl];
      }

      await axios.put(`/api/ads/${id}`, updateData, config);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to update ad');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto flex flex-col min-h-screen pb-10">
      
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-500 text-sm">Update your item's details.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
          <Info className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <form className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 space-y-6" onSubmit={handleSubmit}>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Ad Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1 appearance-none">
              <option value="" disabled>Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Price (₹) {!isPriceOptional && '*'}
              {isPriceOptional && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
            </label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder={isPriceOptional ? "0.00" : ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1 resize-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Update Photo {!isImageOptional && '*'}
            {isImageOptional && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
          </label>
          <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

          {!imagePreview ? (
            <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition">
              <Camera className="w-8 h-8 text-whatsapp mb-2" />
              <p className="font-bold text-gray-900">Upload new photo</p>
            </div>
          ) : (
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-gray-100 p-2" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button type="button" onClick={() => fileInputRef.current.click()} className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-md hover:bg-gray-100">
                  Change Photo
                </button>
                {/* Allow removing image completely if it is optional */}
                {isImageOptional && (
                  <button type="button" onClick={() => {setImagePreview(null); setImageFile(null);}} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-whatsapp hover:bg-whatsappDark transition disabled:bg-green-300 flex items-center justify-center gap-2">
            {isSubmitting ? <><Loader className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAd;