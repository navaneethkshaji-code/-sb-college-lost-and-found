import React from 'react';
import { Compass, PlusCircle, MessageSquare, LogOut, User as UserIcon, Search } from 'lucide-react';

function Navbar({ user, onLogout, currentView, onNavigate }) {
  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none" 
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-sky-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-sky-200">
            <Search className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-700 to-sky-500 bg-clip-text text-transparent">
            LostFound
          </span>
        </div>

        {/* Dynamic Navigation Options */}
        {user ? (
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1.5 ${
                currentView === 'dashboard' 
                  ? 'text-sky-700 bg-sky-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </button>

            <button 
              onClick={() => {
                // We'll open a post reporting form modal on the dashboard page
                onNavigate('dashboard');
                // Trigger report modal open event via dispatching custom event
                setTimeout(() => {
                  window.dispatchEvent(new Event('open-create-post-modal'));
                }, 50);
              }}
              className="px-3 py-2 rounded-lg font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report Item</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* Profile trigger */}
            <button 
              onClick={() => onNavigate('profile')} 
              className={`flex items-center space-x-2 p-1 px-2 rounded-lg transition ${
                currentView === 'profile' ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50'
              }`}
            >
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-8 h-8 rounded-full ring-2 ring-sky-100 object-cover" 
              />
              <span className="hidden md:inline text-sm font-semibold text-slate-700">{user.username}</span>
            </button>

            {/* Logout trigger */}
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        ) : (
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onNavigate('login')} 
              className="px-4 py-2 text-sm font-medium text-sky-700 hover:text-sky-800 transition"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('signup')} 
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-100 rounded-xl transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
