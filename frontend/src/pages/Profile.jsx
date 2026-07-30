// frontend/src/pages/Profile.jsx
import { useState, useContext, useEffect } from 'react';
import { User, Phone, Mail, Loader, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch the user's current info to pre-fill the form
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const fetchUserData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/users/dashboard', config);
        setFormData({
          name: data.name,
          email: data.email,
          whatsappNumber: data.whatsappNumber
        });
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Note: We will create this backend route right after this!
      const { data } = await axios.put('/api/users/profile', formData, config);
      
      setMessage('Profile updated successfully!');
      
      // Update local storage so the Navbar updates instantly
      const updatedUser = { ...user, name: data.name };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      // Note: to fully refresh Context we ideally reload or update the state, 
      // but a quick page reload works smoothly for settings changes:
      setTimeout(() => window.location.reload(), 1500); 

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col min-h-screen pb-10">
      
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Update your personal details and contact information.</p>
      </div>

      {message && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {message}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-medium text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 space-y-6">
        
        {/* Avatar Display */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-whatsapp font-bold text-3xl uppercase">
            {formData.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{formData.name}</h3>
            <p className="text-gray-500 text-sm">Member</p>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1" />
          </div>
        </div>

        {/* Email (Read Only - Usually you don't let users easily change login emails without verification) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
            <input type="email" name="email" value={formData.email} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-500 outline-none cursor-not-allowed" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Email cannot be changed directly. Contact support if needed.</p>
        </div>

        {/* WhatsApp Number */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-whatsapp" /></div>
            <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 outline-none focus:border-whatsapp focus:ring-1" />
          </div>
          <p className="text-xs text-gray-500 mt-2">This is the number buyers will use to chat with you.</p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-black transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2">
            {saving ? <><Loader className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Safety Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p>Your privacy is important to us. We only share your WhatsApp number on the ads you choose to publish.</p>
      </div>

    </div>
  );
};

export default Profile;