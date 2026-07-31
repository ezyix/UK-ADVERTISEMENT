// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Search, Car, Briefcase, Store, Rocket, Laptop, Smartphone, Home as HomeIcon, Loader, X, LayoutDashboard, Sofa, Armchair, ShieldCheck } from 'lucide-react';
import AdCard from '../components/AdCard';

const categories = [
  { name: 'Vehicles', icon: Car, color: 'bg-blue-100 text-blue-600' },
  { name: 'Properties', icon: HomeIcon, color: 'bg-orange-100 text-orange-600' },
  { name: 'Mobiles', icon: Smartphone, color: 'bg-gray-200 text-gray-800' },
  { name: 'Jobs', icon: Briefcase, color: 'bg-purple-100 text-purple-600' },
  { name: 'Services', icon: Store, color: 'bg-green-100 text-green-600' },
  { name: 'Electronics & Appliances', icon: Laptop, color: 'bg-cyan-100 text-cyan-600' },
  { name: 'Furniture', icon: Armchair, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Others', icon: Rocket, color: 'bg-red-100 text-red-600' },
];

const Home = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalAds, setTotalAds] = useState(0);

  // Read URL Parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentKeyword = searchParams.get('keyword') || '';

  const [mobileSearch, setMobileSearch] = useState(currentKeyword);

  // 1. Reset the page to 1 if the user changes the Category or Search Keyword
  useEffect(() => {
    setPage(1);
  }, [currentCategory, currentKeyword]);

  // 2. Fetch the ads whenever the Page, Category, or Keyword changes
  useEffect(() => {
    const fetchAds = async () => {
      // If it's the first page, show the big loader. Otherwise, show the small loader.
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await axios.get(
          `/api/ads?category=${currentCategory}&keyword=${currentKeyword}&page=${page}&limit=8`
        );
        
        // If it's page 1, replace the ads. If page 2+, append them to the bottom!
        if (page === 1) {
          setAds(data.ads);
        } else {
          // Add new ads, ensuring no duplicates
          setAds((prev) => {
            const newAds = data.ads.filter(newAd => !prev.some(p => p._id === newAd._id));
            return [...prev, ...newAds];
          });
        }
        
        setHasMore(data.hasMore);
        setTotalAds(data.totalAds);
      } catch (err) {
        setError('Failed to load ads. Please try again later.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    
    fetchAds();
  }, [currentCategory, currentKeyword, page]);

  // Handle Category Click
  const handleCategoryClick = (categoryName) => {
    if (currentCategory === categoryName) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
  };

  // Handle Mobile Search
  const handleMobileSearch = (e) => {
    if (e.key === 'Enter') {
      if (mobileSearch) searchParams.set('keyword', mobileSearch);
      else searchParams.delete('keyword');
      setSearchParams(searchParams);
    }
  };

  // Clear Search
  const clearSearch = () => {
    searchParams.delete('keyword');
    setSearchParams(searchParams);
    setMobileSearch('');
  };

  return (
    <div className="flex flex-col pb-20">
      
      {/* MOBILE Search Box */}
      <div className="md:hidden bg-white p-3 shadow-sm z-20 sticky top-16">
        <div className="border-2 border-gray-800 rounded flex items-center bg-white overflow-hidden pr-2">
          <Search className="w-5 h-5 text-gray-500 ml-3" />
          <input 
            type="text" 
            placeholder='Search "Jobs", "Mobiles"...' 
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            onKeyDown={handleMobileSearch}
            className="w-full p-2.5 outline-none text-gray-800 text-sm" 
          />
          {currentKeyword && (
            <button onClick={clearSearch} className="p-1 bg-gray-200 rounded-full text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1">
        
        {/* HERO BANNER */}
        <div className="my-6">
            <div
              className="relative overflow-hidden rounded-3xl p-6 md:p-10"
              style={{
                minHeight: 340,
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/10 rounded-3xl" />

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="flex-1 pt-10 md:pt-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
                  Find anything in your<br /><span className="text-emerald-500">neighborhood.</span>
                </h1>
                <p className="mt-3 text-sm md:text-base">
                  <span className="text-black">Buy, sell and discover great deals</span><br />
                  <span className="text-black">around you.</span>
                </p>

                {/* Right-side illustration is now set as the hero background (CSS) */}
              </div>

              {/* Right-side illustration is now set as the hero background (CSS) */}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8 overflow-x-auto hide-scrollbar pb-2">
          <div className="flex md:grid md:grid-cols-8 gap-4 md:gap-6 min-w-max md:min-w-0">
            {categories.map((cat, index) => {
              const isSelected = currentCategory === cat.name;
              return (
                <div 
                  key={index} 
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center gap-2 cursor-pointer group w-20 md:w-auto"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300
                    ${isSelected ? 'bg-gray-800 text-white shadow-md scale-105' : `${cat.color} group-hover:shadow-md group-hover:-translate-y-1`}
                  `}>
                    <cat.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={isSelected ? 2 : 1.5} />
                  </div>
                  <span className={`text-xs md:text-sm text-center ${isSelected ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ADS SECTION */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              {currentKeyword || currentCategory ? 'Search Results' : 'Fresh recommendations'}
            </h3>
            {(currentKeyword || currentCategory) && (
              <span className="text-sm text-gray-500">{totalAds} ads found</span>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader className="w-8 h-8 text-whatsapp animate-spin" /></div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
          ) : ads.length === 0 ? (
            <div className="text-center text-gray-500 p-10 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-lg font-bold text-gray-700 mb-1">No results found</p>
              <p className="text-sm">Try adjusting your category or search keyword.</p>
              <button onClick={() => setSearchParams({})} className="mt-4 text-whatsapp font-bold hover:underline">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {ads.map((ad) => <AdCard key={ad._id} ad={ad} />)}
              </div>
              
              {/* THE "LOAD MORE" BUTTON */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={() => setPage(page + 1)}
                    disabled={loadingMore}
                    className="bg-white border-2 border-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    {loadingMore && <Loader className="w-5 h-5 animate-spin" />}
                    {loadingMore ? 'Loading...' : 'Load More Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

  {/* PREMIUM FOOTER */}
      <footer className="w-full bg-white border-t border-gray-200 mt-auto pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
          
          {/* Trust Badge */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <ShieldCheck className="w-5 h-5 text-whatsapp" />
            <span className="text-sm font-bold text-gray-700 tracking-wide">
              Trusted by a Muslim community.
            </span>
          </div>

          {/* Copyright / Extra Links */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-gray-400 mt-2 font-medium">
            <p>© {new Date().getFullYear()} UK Ads. All rights reserved.</p>
            <div className="hidden md:flex gap-6">
              <span className="hover:text-whatsapp cursor-pointer transition">Privacy Policy</span>
              <span className="hover:text-whatsapp cursor-pointer transition">Terms of Service</span>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Home;
