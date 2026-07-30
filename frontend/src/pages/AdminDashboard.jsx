// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Users, BarChart3, AlertCircle, DollarSign, Trash2, LogOut, Bell, Shield, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [liveAds, setLiveAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security Check: Kick them out if they aren't an admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all ads from the backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await axios.get('/api/ads');
        setLiveAds(data);
      } catch (error) {
        console.error('Failed to fetch ads', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') fetchAds();
  }, [user]);

  // Handle Deleting an Ad
  const handleDelete = async (adId) => {
    if (!window.confirm("Are you sure you want to permanently delete this ad?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/ads/${adId}`, config);
      
      // Remove the ad from the screen immediately without refreshing the page
      setLiveAds(liveAds.filter((ad) => ad._id !== adId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete ad');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>;
  }

  // Calculate dynamic stats
  const totalAds = liveAds.length;
  const paidAds = liveAds.filter(ad => ad.tier === 'paid').length;
  const estimatedRevenue = paidAds * 29; // ₹29 per paid ad

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-10">
      
      {/* TOP HEADER */}
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-whatsapp" />
            <h1 className="text-xl font-bold tracking-wide">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-300 hover:text-white transition">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
              <span className="text-sm font-bold">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <button onClick={logout} className="hidden sm:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition ml-4">
              <LogOut className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Active Ads</p>
              <div className="p-2 rounded-lg bg-green-100"><BarChart3 className="w-5 h-5 text-green-600" /></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">{totalAds}</h2>
            <p className="text-xs font-semibold text-gray-500">Live on platform</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
              <div className="p-2 rounded-lg bg-yellow-100"><DollarSign className="w-5 h-5 text-yellow-600" /></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">₹{estimatedRevenue.toLocaleString()}</h2>
            <p className="text-xs font-semibold text-gray-500">From Featured Ads</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">User Reports</p>
              <div className="p-2 rounded-lg bg-red-100"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">0</h2>
            <p className="text-xs font-semibold text-green-600">All clear!</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
              <div className="p-2 rounded-lg bg-blue-100"><Users className="w-5 h-5 text-blue-600" /></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">--</h2>
            <p className="text-xs font-semibold text-gray-500">System generated</p>
          </div>
        </div>

        {/* MANAGE LIVE ADS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Live Ads</h2>
              <p className="text-sm text-gray-500 mt-1">Review and delete marketplace submissions.</p>
            </div>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveAds.map((ad) => (
              <div key={ad._id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col transition-shadow hover:shadow-md">
                
                {/* Ad Info Header */}
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden p-1">
                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{ad.title}</h3>
                    <p className="text-sm text-gray-500">by {ad.seller?.name || 'Unknown'}</p>
                    <p className="text-xs font-bold text-whatsapp mt-1">₹{ad.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Delete Action Button */}
                <button 
                  onClick={() => handleDelete(ad._id)}
                  className="mt-auto w-full flex justify-center items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold py-2.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Ad
                </button>
              </div>
            ))}
          </div>

          {liveAds.length === 0 && (
            <div className="p-10 text-center text-gray-500">No active ads on the platform.</div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;