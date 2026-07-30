// frontend/src/pages/AdDetails.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Share2, MapPin, Clock, ShieldCheck, MessageCircle, Loader, Heart } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const AdDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext); 
  const [isSaved, setIsSaved] = useState(false); 

  // Fetch the ad from the backend when the page loads
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data } = await axios.get(`/api/ads/${id}`);
        setAd(data);
      } catch (err) {
        console.error("Error fetching ad:", err);
        setError('Ad not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  // Fetch user profile to check if ad is already saved
  useEffect(() => {
    const checkWishlist = async () => {
      if (user) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('/api/users/dashboard', config);
          
          // CRASH FIX: Safely check if wishlist exists and is an array before using .includes()
          if (data?.wishlist && Array.isArray(data.wishlist) && data.wishlist.includes(id)) {
            setIsSaved(true);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    };
    checkWishlist();
  }, [id, user]);

  const handleSaveAd = async () => {
    if (!user) {
      navigate('/auth'); 
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`/api/users/wishlist/${id}`, {}, config);
      setIsSaved(!isSaved); 
    } catch (error) {
      console.error('Failed to save ad', error);
    }
  };

   const handleWhatsAppClick = () => {
     if (!ad?.seller?.whatsappNumber) return;
     const phone = ad.seller.whatsappNumber.replace(/\D/g, '');
     const sellerName = ad.seller.name ? ad.seller.name.split(' ')[0] : 'there';
     const text = `Hi ${sellerName}, I'm interested in your ad for "${ad?.title}" on UK Ads.`;
     window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
   };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error}</div>;
  if (!ad) return null;

  // Safe Formatting
  const formattedDate = ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Unknown date';
  
  const memberSince = ad.seller?.createdAt 
    ? new Date(ad.seller.createdAt).getFullYear() 
    : '2026';

  const mainImage = ad.images && ad.images.length > 0 
    ? ad.images[0] 
    : 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&q=80';

  // CRASH FIX: Safe price formatter
  const displayPrice = ad.price ? ad.price.toLocaleString('en-IN') : '0';

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-[#f9fafa] pb-24 md:pb-12">
      
       {/* MOBILE TOP BAR */}
       <div className="md:hidden flex justify-between items-center p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
         <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
           <ArrowLeft className="w-5 h-5 text-gray-800" />
         </button>
         <span className="font-semibold text-gray-800">UK Ads</span>
         <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
           <Share2 className="w-5 h-5 text-gray-800" />
         </button>
       </div>

      {/* DESKTOP BREADCRUMBS */}
      <div className="hidden md:flex max-w-6xl mx-auto w-full px-6 py-4 items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/')} className="hover:text-whatsapp transition">Home</button>
        <span>/</span>
        <span className="hover:text-whatsapp transition cursor-pointer">{ad?.category}</span>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{ad?.title}</span>
      </div>

      <div className="max-w-6xl mx-auto w-full md:px-6 md:grid md:grid-cols-3 md:gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="md:col-span-2 bg-white md:rounded-2xl md:shadow-sm md:border border-gray-100 overflow-hidden">
          
          <div className="w-full h-72 md:h-[500px] bg-gray-100 p-4">
            <img src={mainImage} alt={ad?.title} className="w-full h-full object-contain rounded-lg shadow-sm bg-white" />
          </div>

          {ad?.images && ad.images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto hide-scrollbar">
              {ad.images.map((img, idx) => (
                <img key={idx} src={img} alt="thumbnail" className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-lg border-2 border-transparent hover:border-whatsapp cursor-pointer transition bg-gray-50" />
              ))}
            </div>
          )}

          <div className="p-4 md:p-8">
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {ad?.category}
            </span>

            {/* Mobile Title & Price */}
            <div className="md:hidden mt-4 border-b border-gray-100 pb-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2 pr-4">{ad?.title}</h1>
                <button onClick={handleSaveAd} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition flex-shrink-0">
                  <Heart className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="flex items-baseline gap-1 text-whatsapp">
                <span className="text-3xl font-extrabold">₹{displayPrice}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {ad?.description}
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Posted on {formattedDate}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Kochi, Kerala
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="p-4 md:p-0 md:sticky md:top-24">
          <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-gray-100 p-6">
            
            {/* Desktop Title & Price */}
            <div className="hidden md:block mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2 pr-4">{ad?.title}</h1>
                <button onClick={handleSaveAd} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition flex-shrink-0">
                  <Heart className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="flex items-baseline gap-1 text-whatsapp">
                <span className="text-4xl font-extrabold">₹{displayPrice}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 mb-6 border border-gray-100">
              <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ad?.seller?.name || 'User'}`} alt="Seller" />
              </div>
              <div>
                 <p className="font-bold text-gray-900">{ad?.seller?.name || 'UK Ads User'}</p>
                <p className="text-sm text-gray-500">Member since {memberSince}</p>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl flex gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p>Safety Tip: Never pay in advance. Always meet the seller in person in a public place.</p>
            </div>

            <button 
              onClick={handleWhatsAppClick}
              className="hidden md:flex w-full bg-whatsapp text-white py-3.5 rounded-xl font-bold text-lg items-center justify-center gap-2 hover:bg-whatsappDark transition shadow-md shadow-green-200"
            >
              <MessageCircle className="w-6 h-6" /> Chat on WhatsApp
            </button>
            
            <div className="mt-4 text-center">
              <button className="text-xs text-red-500 font-semibold hover:underline">⚑ Report this ad</button>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM FOOTER */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-6">
        <button 
          onClick={handleWhatsAppClick}
          className="w-full bg-whatsapp text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-whatsappDark transition shadow-md shadow-green-200"
        >
          <MessageCircle className="w-6 h-6" /> Chat on WhatsApp
        </button>
      </div>

    </div>
  );
};

export default AdDetails;