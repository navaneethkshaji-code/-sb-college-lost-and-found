import React, { useState, useEffect } from 'react';
import HandoverReceiptModal from '../components/HandoverReceiptModal.jsx';
import { User, Mail, Phone, FileText, ChevronRight, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

function Profile({ user, token, onNavigate }) {
  const [myPosts, setMyPosts] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingHandovers, setLoadingHandovers] = useState(true);

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Fetch my posts
  const fetchMyPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (data.success) {
        // Filter client-side for posts created by current user
        const filtered = data.data.filter(p => p.reporter && p.reporter._id === user._id);
        setMyPosts(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch handover receipts
  const fetchHandovers = async () => {
    try {
      const response = await fetch('/api/handovers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHandovers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch handover receipts', err);
    } finally {
      setLoadingHandovers(false);
    }
  };

  // Fetch full details of selected handover receipt before opening modal
  const handleOpenReceipt = async (handoverId) => {
    try {
      const response = await fetch(`/api/handovers/${handoverId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedReceipt(data.data);
        setIsReceiptOpen(true);
      }
    } catch (err) {
      console.error('Failed to load handover details', err);
    }
  };

  useEffect(() => {
    fetchMyPosts();
    fetchHandovers();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Account Info Card */}
      <div className="bg-white/85 backdrop-blur-md border border-white/40 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img 
          src={user.avatar} 
          alt={user.username} 
          className="w-24 h-24 rounded-full object-cover ring-4 ring-sky-100 shadow-md flex-shrink-0" 
        />
        
        <div className="flex-grow text-center sm:text-left space-y-3.5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">{user.username}</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Verified Profile User</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-xs max-w-md mx-auto sm:mx-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Mail className="w-4 h-4 text-sky-500" />
              <span className="truncate">{user.email}</span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Phone className="w-4 h-4 text-sky-500" />
              <span>{user.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Listings vs Handovers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User's Listings */}
        <div className="bg-white/85 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-sm flex flex-col">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Your Listings</h3>
          
          <div className="flex-grow overflow-y-auto space-y-3 max-h-[400px] scrollbar-hide pr-1">
            {loadingPosts ? (
              <div className="text-center py-10">
                <RefreshCw className="w-5 h-5 text-sky-500 animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Loading items...</p>
              </div>
            ) : myPosts.length > 0 ? (
              myPosts.map(post => (
                <div 
                  key={post._id}
                  onClick={() => onNavigate('post-detail', post._id)}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-12 h-12 object-cover rounded-xl flex-shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{post.title}</h4>
                      <div className="flex gap-1.5 mt-1 items-center">
                        {post.status === 'lost' ? (
                          <span className="text-[8px] font-extrabold bg-red-50 text-red-600 px-2 py-0.5 rounded-full uppercase">
                            Lost
                          </span>
                        ) : (
                          <span className="text-[8px] font-extrabold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                            Found
                          </span>
                        )}
                        {post.resolved && (
                          <span className="text-[8px] font-extrabold bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs text-center py-10">You have no active reports filed.</p>
            )}
          </div>
        </div>

        {/* Handover Receipts History */}
        <div className="bg-white/85 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-sm flex flex-col">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Handover Receipts</h3>
          
          <div className="flex-grow overflow-y-auto space-y-3 max-h-[400px] scrollbar-hide pr-1">
            {loadingHandovers ? (
              <div className="text-center py-10">
                <RefreshCw className="w-5 h-5 text-sky-500 animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Loading receipts...</p>
              </div>
            ) : handovers.length > 0 ? (
              handovers.map(receipt => (
                <div 
                  key={receipt._id}
                  onClick={() => handleOpenReceipt(receipt._id)}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100/30 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{receipt.postTitle}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Receipt: {receipt.receiptNo}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No verified handovers locked in your account logs yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Handover Receipts Modal */}
      <HandoverReceiptModal 
        isOpen={isReceiptOpen} 
        receipt={selectedReceipt} 
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedReceipt(null);
        }} 
      />

    </div>
  );
}

export default Profile;
