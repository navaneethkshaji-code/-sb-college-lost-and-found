import React, { useState, useEffect, useMemo } from 'react';
import PostCard from '../components/PostCard.jsx';
import CreatePostModal from '../components/CreatePostModal.jsx';
import { Search, MapPin, Tag, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'keys', name: 'Keys' },
  { id: 'wallet', name: 'Wallet & Cards' },
  { id: 'documents', name: 'Documents & Books' },
  { id: 'clothing', name: 'Clothing & Bags' },
  { id: 'pets', name: 'Pets & Animals' },
  { id: 'others', name: 'Others' }
];

const LOCATIONS = [
  'Central Library',
  'Newmans Block',
  'Padiyara Hall',
  'Kaavukatt Hall',
  'Indoor Stadium',
  'Tower Block',
  'Main Ground',
  'College Cafeteria',
  'Science Block',
  'Arts Block',
  'College Chapel',
  'Auditorium'
];

function Dashboard({ user, token, onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter settings
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, lost, found
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modal open trigger
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch posts from backend
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/posts';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (categoryFilter !== 'all') params.push(`category=${categoryFilter}`);
      if (locationFilter !== 'all') params.push(`location=${locationFilter}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      const resData = await response.json();
      
      if (resData.success) {
        setPosts(resData.data);
      } else {
        setError(resData.message || 'Failed to fetch reports feed');
      }
    } catch (err) {
      setError('Could not connect to the backend server. Please verify it is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger query load when filters change
  useEffect(() => {
    fetchPosts();
  }, [statusFilter, categoryFilter, locationFilter, searchQuery]);

  // Listen to navigation events from Navbar to open create modal
  useEffect(() => {
    const handleOpenModal = () => {
      if (!user) {
        onNavigate('login');
      } else {
        setIsCreateModalOpen(true);
      }
    };

    window.addEventListener('open-create-post-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-create-post-modal', handleOpenModal);
    };
  }, [user, onNavigate]);

  // Derive unique locations present in current listings for filtering dropdown
  const uniqueLocations = useMemo(() => {
    const locs = posts.map(p => p.location).filter(Boolean);
    return Array.from(new Set(locs));
  }, [posts]);

  // Handle post creation success callback
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    onNavigate('post-detail', newPost._id);
  };

  return (
    <div className="space-y-8">
      {/* Visual greeting card */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-700 via-sky-600 to-sky-400 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">SB College Lost & Found</h1>
          <p className="text-sky-100 text-sm sm:text-base mb-6 leading-relaxed">
            Official portal for St. Berchmans College, Chaganasherry. Securely report lost items, match found belongings, and log verified handovers on campus.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                if (!user) return onNavigate('login');
                setIsCreateModalOpen(true);
              }}
              className="bg-white text-sky-700 font-bold px-5 py-3 rounded-xl hover:bg-sky-50 transition shadow-lg text-sm"
            >
              Report an Item
            </button>
            <button 
              onClick={() => {
                setStatusFilter(statusFilter === 'lost' ? 'all' : 'lost');
              }}
              className="bg-sky-800 bg-opacity-40 border border-sky-400 border-opacity-45 text-white hover:bg-opacity-65 font-semibold px-5 py-3 rounded-xl transition text-sm"
            >
              Browse Lost Items
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by keywords, markings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          />
        </div>

        {/* Action dropdown filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition cursor-pointer text-slate-600 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="lost">Lost Reports</option>
            <option value="found">Found Reports</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition cursor-pointer text-slate-600 font-medium"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition cursor-pointer text-slate-600 font-medium"
          >
            <option value="all">All Locations</option>
            {LOCATIONS.map((loc, idx) => (
              <option key={`preset-${idx}`} value={loc}>{loc}</option>
            ))}
            {uniqueLocations.filter(loc => loc && !LOCATIONS.includes(loc)).map((loc, idx) => (
              <option key={`custom-${idx}`} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading feed listings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 mb-1">Connection Issue</h3>
          <p className="text-red-600 text-xs mb-4">{error}</p>
          <button 
            onClick={fetchPosts} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Retry Connection
          </button>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onClick={() => onNavigate('post-detail', post._id)} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/85 backdrop-blur-md border border-white/40 text-center py-16 px-4 rounded-3xl max-w-xl mx-auto shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-900 mb-1">No Matching Reports</h3>
          <p className="text-slate-500 text-xs">We couldn't find any listings matching your search or filters. Try adjusting your settings.</p>
        </div>
      )}

      {/* Reporting Modal overlay */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        token={token} 
        onSuccess={handlePostCreated} 
      />
    </div>
  );
}

export default Dashboard;
