// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Check if user is already logged in when the app loads
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // 2. Register Function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/users/register', userData);
      // Save token & user data to local storage
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      setUser(response.data);
      navigate('/dashboard'); // Redirect to dashboard after signup
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Login Function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      setUser(response.data);
      // If admin logs in, send to admin page, else user dashboard
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;