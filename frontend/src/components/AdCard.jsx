// frontend/src/components/AdCard.jsx
import { MapPin, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdCard = ({ ad }) => {
  // Format the MongoDB date to something readable
  const formattedDate = new Date(ad.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  });

  return (
    <Link to={`/ad/${ad._id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col group">
      
      {/* Image Section */}
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
        <img 
          src={ad.images && ad.images.length > 0 ? ad.images[0] : 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=600&q=80'} 
          alt={ad.title} 
          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300 p-2"
        />
        
        {/* Featured Badge */}
        {ad.tier === 'paid' && (
          <div className="absolute top-3 left-3 bg-whatsapp text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md uppercase">
            ★ Featured
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
          {ad.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-whatsapp mb-1">₹{ad.price.toLocaleString('en-IN')}</h3>
        <p className="text-gray-800 font-semibold text-sm line-clamp-2 mb-4">
          {ad.title}
        </p>

        {/* Footer info */}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">Kochi</span> {/* Hardcoded for now, can add to DB later */}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AdCard;