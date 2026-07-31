// frontend/src/pages/Wishlist.jsx
import { useState, useEffect, useContext } from 'react';
import { Heart, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AdCard from '../components/AdCard';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchWishlist = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/users/wishlist', config);
        setAds(data);
      } catch (error) {
        console.error('Error fetching wishlist', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-screen pb-10">
      
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Wishlist</h1>
            <p className="text-gray-500 mt-1">Ads you have saved for later.</p>
          </div>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="text-center text-gray-500 p-10 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
          <Heart className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-lg font-bold text-gray-700 mb-1">No saved ads</p>
          <p className="text-sm">Click the heart icon on any ad to save it here.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-gray-900 text-white font-bold px-6 py-2 rounded-lg hover:bg-black">
            Explore Ads
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {ads.map((ad) => <AdCard key={ad._id} ad={ad} />)}
        </div>
      )}
      
    </div>
  );
};

export default Wishlist;