// frontend/src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FloatingPostButton from './FloatingPostButton';

const Layout = () => {
  return (
    // Removed pb-24 because we don't have a bottom bar taking up space anymore!
    <div className="min-h-screen bg-[#f9fafa] relative overflow-x-hidden">
      
      {/* Unified Navbar handles everything top-level */}
      <Navbar />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
      
      {/* Mobile Floating Action Button */}
      <FloatingPostButton />
      
    </div>
  );
};

export default Layout;