// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- Import the Provider
import Layout from './components/Layout';
import Home from './pages/Home';
import AdDetails from './pages/AdDetails';
import CreateAd from './pages/CreateAd';
import EditAd from './pages/EditAd';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <BrowserRouter>
      {/* Wrap everything inside AuthProvider so all pages can access the user data */}
      <AuthProvider>
        <Routes>
          
          <Route path="/auth" element={<Auth />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ad/:id" element={<AdDetails />} />
            <Route path="/create" element={<CreateAd />} />
            <Route path="/edit-ad/:id" element={<EditAd />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>

          <Route path="/admin" element={<AdminDashboard />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;