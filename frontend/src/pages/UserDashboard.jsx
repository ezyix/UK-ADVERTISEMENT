// frontend/src/pages/UserDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Gift, Copy, Check, Eye, Heart, Edit, Trash2, Tag, Filter, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch real user data and ads from the backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };

        // Fetch User's Referral & Profile Data
        const { data: profileData } = await axios.get('/api/users/dashboard', config);
        setDashboardData(profileData);

        // Fetch User's Ads
        const { data: adsData } = await axios.get('/api/ads/user/myads', config);
        setMyAds(adsData);

      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleCopyLink = () => {
    // Dynamically generate their unique referral link based on the current website URL
    const referralUrl = `${window.location.origin}/auth?ref=${dashboardData.referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Delete Ad
  const handleDeleteAd = async (adId) => {
    if (!window.confirm("Are you sure you want to delete this ad? This cannot be undone.")) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/ads/${adId}`, config);
      
      // Instantly remove the ad from the screen without refreshing
      setMyAds(myAds.filter((ad) => ad._id !== adId));
    } catch (error) {
      alert('Failed to delete ad');
    }
  };

  // Handle Mark as Sold
  const handleMarkAsSold = async (adId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`/api/ads/${adId}/sold`, {}, config);
      
      // Update the ad's status on the screen instantly
      setMyAds(myAds.map((ad) => 
        ad._id === adId ? { ...ad, status: 'sold' } : ad
      ));
    } catch (error) {
      alert('Failed to update ad');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-gray-100 text-gray-600';
      case 'pending': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafa]">
        <Loader className="w-8 h-8 text-whatsapp animate-spin" />
      </div>
    );
  }

  // Calculate referral progress (Max 5 for the progress bar)
  const referralsCompleted = dashboardData.referralCount;
  const referralsNeeded = 5;
  const progressPercent = Math.min((referralsCompleted / referralsNeeded) * 100, 100);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col min-h-screen">
      
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {dashboardData.name.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Manage your listings and community activity.</p>
      </div>

      {/* EARN FREE ADS CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5 md:p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-whatsapp" />
              <h2 className="text-xl font-bold text-gray-900">Earn Free Ads</h2>
            </div>
            {/* Show how many free ads they currently have unlocked */}
            {dashboardData.freeAdsAvailable > 0 && (
              <span className="bg-whatsapp text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {dashboardData.freeAdsAvailable} Free Ad(s) Ready!
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-6">Refer your neighbors and get rewarded.</p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Progress</span>
              <span className="font-bold text-gray-800">{referralsCompleted} / {referralsNeeded} referrals</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-whatsapp h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Alert Box */}
          <div className="bg-green-50 text-green-800 p-3 rounded-xl text-sm mb-6 flex items-start gap-2 border border-green-100">
            <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-green-200 flex-shrink-0 mt-0.5">i</div>
            <p>
              {referralsCompleted >= 5 
                ? <span className="font-bold text-whatsapp">Goal reached! Keep inviting to earn more free ads.</span>
                : <>Refer {referralsNeeded - referralsCompleted} more friends to <span className="font-bold text-whatsapp">Unlock a Free Ad!</span></>}
            </p>
          </div>

          {/* Copy Link Input */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Your Referral Link</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/auth?ref=${dashboardData.referralCode}`}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none text-sm"
              />
              <button 
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-colors min-w-[100px] justify-center ${copied ? 'bg-gray-800' : 'bg-whatsapp hover:bg-whatsappDark'}`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MY ADS SECTION */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Ads</h2>
          <button className="flex items-center gap-1 text-sm font-semibold text-whatsapp hover:underline">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Ad List */}
        {myAds.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't posted any ads yet.</p>
            <button onClick={() => navigate('/create')} className="bg-whatsapp text-white px-6 py-2 rounded-lg font-bold hover:bg-whatsappDark transition">
              Post your first Ad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {myAds.map((ad) => (
              <div key={ad._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
                
                {/* Image */}
                <div className="relative h-48 sm:h-auto sm:w-40 bg-gray-200 flex-shrink-0">
                  <img src={ad.images[0] || 'https://via.placeholder.com/400'} alt={ad.title} className="w-full h-full object-cover" />
                  {ad.tier === 'paid' && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-1 rounded">FEATURED</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight pr-2 line-clamp-1">{ad.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    📅 {new Date(ad.createdAt).toLocaleDateString()}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {ad.views} Views</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                    {/* Dynamic Sold/Renew Button */}
    {ad.status === 'sold' ? (
      <div className="flex-1 bg-gray-50 text-gray-500 font-bold py-2 px-3 rounded-lg text-sm text-center border border-gray-200">
        Item Sold
      </div>
    ) : (
      <button 
        onClick={() => handleMarkAsSold(ad._id)}
        className="flex-1 bg-gray-100 hover:bg-green-50 hover:text-whatsapp hover:border-whatsapp text-gray-700 font-semibold py-2 px-3 rounded-lg text-sm transition border border-transparent"
      >
        Mark as Sold
      </button>
    )}
                    {/* Edit Button */}
<button 
  onClick={() => navigate(`/edit-ad/${ad._id}`)} 
  className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-whatsapp transition"
  title="Edit Ad"
>
  <Edit className="w-4 h-4" />
</button>
                    {/* Delete Button */}
    <button 
      onClick={() => handleDeleteAd(ad._id)}
      className="p-2 border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 transition"
      title="Delete Ad"
    >
      <Trash2 className="w-4 h-4" />
    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;