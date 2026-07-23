import React from 'react';
import { MapPin, Calendar, CheckCircle2, Laptop, Key, CreditCard, FileText, Shirt, PawPrint, HelpCircle } from 'lucide-react';

const CATEGORY_MAP = {
  electronics: { name: 'Electronics', icon: Laptop },
  keys: { name: 'Keys', icon: Key },
  wallet: { name: 'Wallet & Cards', icon: CreditCard },
  documents: { name: 'Documents & Books', icon: FileText },
  clothing: { name: 'Clothing & Bags', icon: Shirt },
  pets: { name: 'Pets & Animals', icon: PawPrint },
  others: { name: 'Others', icon: HelpCircle }
};

function PostCard({ post, onClick }) {
  const categoryInfo = CATEGORY_MAP[post.category] || CATEGORY_MAP.others;
  const CategoryIcon = categoryInfo.icon;

  const formattedDate = new Date(post.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      onClick={onClick}
      className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/30"
    >
      {/* Photo Header */}
      <div className="relative h-48 bg-slate-100 overflow-hidden select-none">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          {post.status === 'lost' ? (
            <span className="bg-red-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              LOST
            </span>
          ) : (
            <span className="bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              FOUND
            </span>
          )}
          {post.resolved && (
            <span className="bg-sky-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> CLAIMED
            </span>
          )}
        </div>
        
        {/* Category Tag */}
        <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
          <CategoryIcon className="w-3.5 h-3.5" />
          <span>{categoryInfo.name}</span>
        </div>
      </div>

      {/* Info content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-950 mb-1.5 line-clamp-1 text-base group-hover:text-sky-600">
            {post.title}
          </h3>
          <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Card footer details */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span className="truncate">{post.location}</span>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
