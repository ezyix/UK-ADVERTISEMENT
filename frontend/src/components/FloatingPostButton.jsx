// frontend/src/components/FloatingPostButton.jsx
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingPostButton = () => {
  return (
    // md:hidden hides this on desktop, where we will have a button in the top header instead
    <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <Link 
        to="/create" 
        className="bg-white border-[3px] border-whatsapp text-gray-900 px-5 py-3 rounded-full font-extrabold flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform"
      >
        <Plus strokeWidth={4} className="w-5 h-5 text-whatsapp" />
        POST AD
      </Link>
    </div>
  );
};

export default FloatingPostButton;