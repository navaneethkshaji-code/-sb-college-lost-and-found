import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './views/Dashboard.jsx';
import PostDetail from './views/PostDetail.jsx';
import Profile from './views/Profile.jsx';
import Login from './views/Login.jsx';
import Signup from './views/Signup.jsx';

function App() {
  // Authentication states
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation states
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, post-detail, profile, login, signup
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Sync authentication token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync user profile to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Handle Login authentication
  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentView('dashboard');
  };

  // Handle Signup authentication
  const handleSignup = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentView('dashboard');
  };

  // Handle Log Out
  const handleLogout = () => {
    setUser(null);
    setToken('');
    setCurrentView('dashboard');
  };

  // Navigate helper
  const navigateTo = (view, postId = null) => {
    setCurrentView(view);
    if (postId) {
      setSelectedPostId(postId);
    } else {
      setSelectedPostId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Shared Responsive Header */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentView={currentView}
        onNavigate={navigateTo} 
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard 
            user={user} 
            token={token} 
            onNavigate={navigateTo} 
          />
        )}
        
        {currentView === 'post-detail' && selectedPostId && (
          <PostDetail 
            postId={selectedPostId} 
            user={user} 
            token={token} 
            onNavigate={navigateTo} 
          />
        )}

        {currentView === 'profile' && user && (
          <Profile 
            user={user} 
            token={token} 
            onNavigate={navigateTo} 
          />
        )}

        {currentView === 'login' && (
          <Login 
            onLogin={handleLogin} 
            onNavigate={navigateTo} 
          />
        )}

        {currentView === 'signup' && (
          <Signup 
            onSignup={handleSignup} 
            onNavigate={navigateTo} 
          />
        )}
      </main>

      {/* Standard Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p>© 2026 LostFound Portal Inc. Built with React and Tailwind CSS. All rights reserved.</p>
          <p className="mt-2 text-slate-600">Reassuring local community network integration security layer active.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
