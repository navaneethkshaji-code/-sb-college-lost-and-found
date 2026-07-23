import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';

function Login({ onLogin, onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (resData.success) {
        onLogin(resData.data, resData.data.token);
      } else {
        setError(resData.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection failure. Please verify the backend API server is online.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white/85 backdrop-blur-md border border-white/40 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="text-slate-400 text-xs">Log in to safely retrieve, match, or claim belongings</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-xs text-red-600">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. sarah@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold rounded-xl text-sm transition shadow-md shadow-sky-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <React.Fragment>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Logging In...
              </React.Fragment>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400">Don't have an account? </span>
          <button 
            onClick={() => onNavigate('signup')}
            className="text-sky-600 hover:text-sky-700 font-bold"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
