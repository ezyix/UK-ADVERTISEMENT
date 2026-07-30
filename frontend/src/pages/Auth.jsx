// frontend/src/pages/Auth.jsx
import { useState, useContext } from 'react';
import { Mail, Lock, User, Phone, Gift, ArrowRight, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext'; // <-- Import context

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Connect to our global state
  const { login, register, loading, error } = useContext(AuthContext);

  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsappNumber: '',
    referralCodeInput: ''
  });

  // Handle typing in inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      login(formData.email, formData.password);
    } else {
      register(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
           {isLogin ? 'Welcome back to UK Ads' : 'Join your local community'}
         </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="font-medium text-whatsapp hover:text-whatsappDark transition-colors"
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Display Backend Errors Here */}
          {error && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg flex items-center gap-2 text-sm text-red-700 border border-red-200">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Register Only Fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin} className="focus:ring-whatsapp block w-full pl-10 border-gray-300 rounded-xl py-3 bg-gray-50 border outline-none" placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                    <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required={!isLogin} className="focus:ring-whatsapp block w-full pl-10 border-gray-300 rounded-xl py-3 bg-gray-50 border outline-none" placeholder="919876543210" />
                  </div>
                </div>
              </>
            )}

            {/* Email (Both) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="focus:ring-whatsapp block w-full pl-10 border-gray-300 rounded-xl py-3 bg-gray-50 border outline-none" placeholder="you@example.com" />
              </div>
            </div>

            {/* Password (Both) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="focus:ring-whatsapp block w-full pl-10 border-gray-300 rounded-xl py-3 bg-gray-50 border outline-none" placeholder="••••••••" />
              </div>
            </div>

            {/* Referral Code (Register Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 flex justify-between">
                  <span>Referral Code</span><span className="text-gray-400 text-xs">Optional</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Gift className="h-5 w-5 text-whatsapp" /></div>
                  <input type="text" name="referralCodeInput" value={formData.referralCodeInput} onChange={handleChange} className="focus:ring-whatsapp block w-full pl-10 border-gray-300 rounded-xl py-3 bg-green-50/50 border outline-none" placeholder="e.g. ALEX-8F2A" />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-whatsapp hover:bg-whatsappDark disabled:bg-gray-400 transition-colors">
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;