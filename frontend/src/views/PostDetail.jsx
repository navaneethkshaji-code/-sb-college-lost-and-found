import React, { useState, useEffect, useRef } from 'react';
import HandoverReceiptModal from '../components/HandoverReceiptModal.jsx';
import { 
  MapPin, Calendar, CheckCircle2, MessageSquare, Send, Award, Sparkles, 
  ChevronRight, RefreshCw, AlertCircle, Phone, Mail, ShieldAlert, ArrowLeft 
} from 'lucide-react';

const CATEGORIES = {
  electronics: 'Electronics',
  keys: 'Keys',
  wallet: 'Wallet & Cards',
  documents: 'Documents & Books',
  clothing: 'Clothing & Bags',
  pets: 'Pets & Animals',
  others: 'Others'
};

function PostDetail({ postId, user, token, onNavigate }) {
  const [post, setPost] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat messaging states
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [activePartner, setActivePartner] = useState(null); // The user currently chatting with
  const [conversations, setConversations] = useState([]); // Unique chat partners list for the reporter
  const messageEndRef = useRef(null);

  // Handover generation states
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverPartnerId, setHandoverPartnerId] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Fetch post details & matching items
  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();
      if (data.success) {
        setPost(data.data);
        setMatches(data.matches || []);
        
        // If post has a receipt, set it
        if (data.data.resolved && data.data.resolvedWith) {
          setReceipt(data.data.resolvedWith);
        }
      } else {
        setError(data.message || 'Post report not found');
      }
    } catch (err) {
      setError('Could not connect to the backend server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch post message logs
  const fetchMessages = async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/posts/${postId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Compile a list of unique conversation partners if current user is the reporter
        if (post && user && post.reporter._id === user._id) {
          const partnersMap = new Map();
          data.data.forEach(msg => {
            const partner = msg.sender._id === user._id ? msg.receiver : msg.sender;
            if (partner && partner._id !== user._id) {
              partnersMap.set(partner._id, partner);
            }
          });
          const uniquePartners = Array.from(partnersMap.values());
          setConversations(uniquePartners);
          
          // Select default partner if none is active
          if (uniquePartners.length > 0 && !activePartner) {
            setActivePartner(uniquePartners[0]);
          }
        } else if (post && user && post.reporter._id !== user._id) {
          // If current user is not reporter, chat is strictly with the reporter
          setActivePartner(post.reporter);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages logs', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPostDetails();
  }, [postId]);

  useEffect(() => {
    if (post && user) {
      fetchMessages();
      // Poll for messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [post, user, activePartner]);

  // Scroll to bottom of chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartner]);

  // Send in-app message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activePartner || !token) return;

    try {
      const response = await fetch(`/api/posts/${postId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activePartner._id,
          text: newMessageText
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewMessageText('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit claim resolution
  const handleCompleteHandover = async (e) => {
    e.preventDefault();
    if (!handoverPartnerId) return;

    setResolving(true);
    try {
      const response = await fetch(`/api/handovers/resolve/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partnerId: handoverPartnerId,
          notes: handoverNotes
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setReceipt(data.data);
        setShowHandoverForm(false);
        setIsReceiptModalOpen(true);
        // Refresh post details status
        fetchPostDetails();
      } else {
        alert(data.message || 'Failed to complete resolution handover');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server');
    } finally {
      setResolving(false);
    }
  };

  // Filter messages for active thread conversation
  const activeChatMessages = messages.filter(msg => {
    if (!activePartner || !user) return false;
    const isSender = msg.sender._id === user._id && msg.receiver._id === activePartner._id;
    const isReceiver = msg.sender._id === activePartner._id && msg.receiver._id === user._id;
    return isSender || isReceiver;
  });

  if (loading) {
    return (
      <div className="text-center py-24">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading report details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-slate-900 mb-2">Item Not Found</h3>
        <p className="text-red-600 text-xs mb-6">{error || 'This report may have been retracted or does not exist.'}</p>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const isReporter = user && post.reporter._id === user._id;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Post Core Details - Col 1 & 2 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-3xl overflow-hidden shadow-sm">
            {/* Visual media */}
            <div className="relative h-80 sm:h-[400px] bg-slate-100 select-none">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {post.status === 'lost' ? (
                  <span className="bg-red-500 text-white font-bold text-xs tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md">
                    LOST REPORT
                  </span>
                ) : (
                  <span className="bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md">
                    FOUND REPORT
                  </span>
                )}
                {post.resolved && (
                  <span className="bg-sky-600 text-white font-bold text-xs tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
                  </span>
                )}
              </div>
            </div>

            {/* Information section */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-1.5 text-xs text-sky-600 font-semibold mb-3">
                <span>{CATEGORIES[post.category]}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-4">{post.title}</h2>
              
              {/* Location/Date widget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-9 h-9 bg-white shadow-sm rounded-xl flex items-center justify-center text-sky-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Location</p>
                    <p className="font-bold text-slate-800">{post.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-9 h-9 bg-white shadow-sm rounded-xl flex items-center justify-center text-sky-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Date {post.status === 'lost' ? 'Lost' : 'Found'}</p>
                    <p className="font-bold text-slate-800">{new Date(post.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <h3 className="font-bold text-base text-slate-900 mb-2">Description Details</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line mb-8">
                {post.description}
              </p>

              {/* Owner Resolution Drawer Action */}
              {user && (
                <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={post.reporter.avatar} 
                      alt={post.reporter.username} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" 
                    />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Reported by</p>
                      <p className="font-bold text-sm text-slate-800">{post.reporter.username}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Reporter Actions */}
                    {isReporter && !post.resolved && !showHandoverForm && (
                      <button 
                        onClick={() => {
                          setShowHandoverForm(true);
                          setHandoverPartnerId(conversations[0]?._id || '');
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-100 transition flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" /> Mark Resolved
                      </button>
                    )}

                    {post.resolved && receipt && (
                      <button 
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-100 transition flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> View Handover Receipt
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Handover Form overlay */}
          {showHandoverForm && (
            <div className="bg-white/85 backdrop-blur-md border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" /> Log Handover & Claims Resolution
              </h3>
              <p className="text-xs text-slate-500">
                Generate an official, printable receipt certifying the safe return of the item. Roles (Owner and Finder) are determined by report metadata.
              </p>

              <form onSubmit={handleCompleteHandover} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Partner</label>
                    <select
                      value={handoverPartnerId}
                      onChange={(e) => setHandoverPartnerId(e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="" disabled>-- Select User --</option>
                      {conversations.map(p => (
                        <option key={p._id} value={p._id}>{p.username} ({p.email})</option>
                      ))}
                      {/* Fallback to custom entry if no messages */}
                      {conversations.length === 0 && (
                        <option value="" disabled>No chats active (cannot resolve without partner)</option>
                      )}
                    </select>
                    {conversations.length === 0 && (
                      <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> A user must message you first to establish contact.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Handover Date</label>
                    <input 
                      type="text" 
                      disabled 
                      value={new Date().toLocaleDateString()} 
                      className="block w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Verification Notes</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="e.g. 'Met at Central Cafe. Claimant verified the passport photo matches their details.'"
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowHandoverForm(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={resolving || !handoverPartnerId}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-100"
                  >
                    {resolving ? 'Resolving...' : 'Generate verified receipt'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Secure Chat Component */}
          {user && !post.resolved && (
            <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[400px]">
              {/* Chat header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-500" />
                  <span className="font-bold text-sm text-slate-900">
                    {isReporter ? 'Secure Conversations' : 'Connect with Discoverer'}
                  </span>
                </div>
                
                {/* Partner selector for original poster */}
                {isReporter && conversations.length > 0 && (
                  <select 
                    value={activePartner?._id || ''} 
                    onChange={(e) => setActivePartner(conversations.find(p => p._id === e.target.value))}
                    className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    {conversations.map(p => (
                      <option key={p._id} value={p._id}>{p.username}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Chat Stream */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide">
                {activePartner ? (
                  activeChatMessages.length > 0 ? (
                    activeChatMessages.map(msg => {
                      const isMe = msg.sender._id === user._id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm shadow-sm ${
                            isMe 
                              ? 'bg-sky-600 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                          }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                            <p className={`text-[9px] text-right mt-1.5 ${isMe ? 'text-sky-200' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>Send a secure message to introduce yourself and coordinate handover.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No active message channel. Wait for claimants or discoverers to message you.</p>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Message Input */}
              {activePartner && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type a secure message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-grow px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-100 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {!user && (
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl text-center">
              <ShieldAlert className="w-8 h-8 text-sky-500 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800 mb-1">Secure Messaging Locked</h4>
              <p className="text-slate-500 text-xs mb-4">Please log in or register to securely connect with this listing's reporter.</p>
              <button 
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl transition"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Matches Sidebar - Col 3 */}
        <div className="space-y-6">
          <div className="bg-white/85 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-sky-700 font-bold mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base">Match Suggestions</h3>
            </div>

            <p className="text-slate-500 text-xs mb-4 leading-relaxed">
              We automatically cross-reference post details (category, title keyphrases, and location) to locate matching items.
            </p>

            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map(match => (
                  <div 
                    key={match._id}
                    onClick={() => onNavigate('post-detail', match._id)}
                    className="p-3 bg-white hover:bg-sky-50 rounded-2xl border border-slate-100 shadow-sm cursor-pointer transition-all flex items-center gap-3"
                  >
                    <img 
                      src={match.imageUrl} 
                      alt={match.title} 
                      className="w-12 h-12 object-cover rounded-xl flex-shrink-0" 
                    />
                    <div className="flex-grow min-w-0">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                        match.status === 'lost' ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {match.status}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{match.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{match.location}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <RefreshCw className="w-6 h-6 text-slate-300 mx-auto mb-2 animate-pulse" />
                <p className="text-slate-500 text-xs font-semibold">Scanning for correlations...</p>
                <p className="text-[10px] text-slate-400 mt-1">No direct matching listings found yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handover Receipts Modal */}
      <HandoverReceiptModal 
        isOpen={isReceiptModalOpen} 
        receipt={receipt} 
        onClose={() => setIsReceiptModalOpen(false)} 
      />
    </div>
  );
}

export default PostDetail;
