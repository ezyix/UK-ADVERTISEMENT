// frontend/src/components/Navbar.jsx
import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search, MapPin, X, User, Tag, Gift, Heart, HelpCircle, Plus, LogOut, ChevronDown, Settings } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [desktopSearch, setDesktopSearch] = useState(searchParams.get('keyword') || '');

  // Close desktop dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDesktopSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (desktopSearch) navigate(`/?keyword=${desktopSearch}`);
      else navigate('/');
    }
  };

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <div className="bg-white shadow-sm sticky top-0 z-30 w-full border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full px-4 h-16 flex justify-between items-center gap-4">
          
          <button className="md:hidden p-1 text-gray-700" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-7 h-7" />
          </button>

           <Link to="/" className="flex items-center gap-2 flex-shrink-0">
             <h1 className="text-2xl font-black text-whatsapp tracking-tight">UK Ads</h1>
           </Link>

          <div className="hidden sm:flex items-center gap-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">Kochi, Kerala</span>
          </div>

          {/* Desktop: Big Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="w-full border-2 border-gray-800 rounded-lg flex overflow-hidden focus-within:border-whatsapp bg-white">
              <input 
                type="text" 
                placeholder='Search "Cars", "Mobiles", "Jobs"...' 
                value={desktopSearch}
                onChange={(e) => setDesktopSearch(e.target.value)}
                onKeyDown={handleDesktopSearch}
                className="w-full px-4 outline-none text-gray-800"
              />
              <button onClick={handleDesktopSearch} className="bg-gray-800 text-white px-6 hover:bg-black transition-colors flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop: Right Side Links & Profile */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            
            {user ? (
              <div className="relative flex items-center gap-6" ref={dropdownRef}>
                {/* External Quick Link */}
                <Link to="/dashboard" className="text-gray-800 font-bold hover:underline">My Ads</Link>
                
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1 hover:opacity-80 transition">
                  <div className="w-10 h-10 bg-green-100 border border-green-200 rounded-full flex items-center justify-center text-whatsapp font-bold text-lg uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
{isDropdownOpen && (
  <div className="absolute top-12 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-whatsapp font-bold text-xl flex-shrink-0 uppercase">
        {user.name.charAt(0)}
      </div>
      <div>
        <p className="font-bold text-gray-900 truncate">{user.name}</p>
        {/* UPDATED LINK */}
      </div>
    </div>
    
    <div className="py-2">
      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 text-gray-700">
        <Settings className="w-5 h-5" /> <span className="font-medium">Profile Settings</span>
      </Link>
      
      <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 text-gray-700">
        <Heart className="w-5 h-5" /> <span className="font-medium">Wishlist</span>
      </Link>
      
      {/* DELETED THE EARN FREE ADS LINK FROM HERE */}
      
      <hr className="my-2 border-gray-100" />
      <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-red-50 text-red-600 text-left transition-colors">
        <LogOut className="w-5 h-5" /> <span className="font-medium">Logout</span>
      </button>
    </div>
  </div>
)}
              </div>
            ) : (
              <Link to="/auth" className="text-gray-800 font-bold hover:underline flex items-center gap-2">
                <User className="w-5 h-5" /> Login
              </Link>
            )}
            
            <Link to="/create" className="bg-white border-[3px] border-whatsapp text-gray-900 px-6 py-2 rounded-full font-bold flex items-center gap-1 hover:shadow-lg transition-all">
              <Plus strokeWidth={3} className="w-5 h-5 text-whatsapp" /> SELL
            </Link>
          </div>
        </div>
      </div>

      {/* --- MOBILE SIDEBAR (PROFILE PAGE) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 transform transition-transform duration-300 md:hidden overflow-y-auto flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Profile Header */}
<div className="bg-gray-50 p-6 flex flex-col justify-center border-b border-gray-200 relative">
  <button className="absolute top-4 right-4 p-2 text-gray-500" onClick={() => setIsSidebarOpen(false)}>
    <X className="w-6 h-6" />
  </button>
  
           {user ? (
             <>
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-whatsapp font-bold text-3xl shadow-sm border border-green-200 uppercase">
                 {user.name.charAt(0)}
               </div>
               <h2 className="text-xl font-bold text-gray-900">Hello, {user.name.split(' ')[0]}!</h2>
               <p className="text-sm text-gray-500 mb-4">Manage your ads and referrals here.</p>
               
               {/* UPDATED LINK */}
             </>
           ) : (
                     <>
                       <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                         <User className="w-8 h-8 text-white" />
                       </div>
                       <h2 className="text-xl font-bold text-gray-900">Welcome to UK Ads!</h2>
                       <p className="text-sm text-gray-500 mb-4">Take charge of your buying and selling journey.</p>
              
              <Link to="/auth" onClick={() => setIsSidebarOpen(false)} className="w-full block text-center bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors">
                Login or Register
              </Link>
            </>
          )}
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col py-2 flex-1">
          <Link to="/create" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800">
            <Plus className="w-6 h-6 text-gray-600" /> <span className="font-semibold text-lg">Start selling</span>
          </Link>
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800">
            <Tag className="w-6 h-6 text-gray-600" /> <span className="font-semibold text-lg">My Ads</span>
          </Link>

          {/* NEW: Profile Settings (Mobile) */}
          {user && (
            <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800">
              <Settings className="w-6 h-6 text-gray-600" /> <span className="font-semibold text-lg">Profile Settings</span>
            </Link>
          )}

          {/* UPDATED: Wishlist (Mobile) */}
          <Link to="/wishlist" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800">
            <Heart className="w-6 h-6 text-gray-600" /> <span className="font-semibold text-lg">Wishlist</span>
          </Link>
          
          <button className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800 w-full text-left">
            <HelpCircle className="w-6 h-6 text-gray-600" /> <span className="font-semibold text-lg">Help & Support</span>
          </button>

          {user && (
            <div className="mt-auto pb-6">
              <hr className="my-2 border-gray-100" />
              <button onClick={() => { logout(); setIsSidebarOpen(false); }} className="flex items-center gap-4 px-6 py-4 hover:bg-red-50 text-red-600 w-full text-left transition">
                <LogOut className="w-6 h-6 text-red-500" /> <span className="font-semibold text-lg">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;