import React, { useState } from 'react';
import { X, Upload, MapPin, Calendar, FileText, Tag, AlertCircle } from 'lucide-react';

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

function CreatePostModal({ isOpen, onClose, token, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    date: new Date().toISOString().split('T')[0],
    location: '',
    status: 'lost'
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('date', formData.date);
      data.append('location', formData.location);
      data.append('status', formData.status);
      
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const resData = await response.json();

      if (resData.success) {
        onSuccess(resData.data);
        handleClose();
      } else {
        setError(resData.message || 'Failed to submit report');
      }
    } catch (err) {
      setError('An error occurred. Please make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'electronics',
      date: new Date().toISOString().split('T')[0],
      location: '',
      status: 'lost'
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-md border border-white/40 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Report Lost or Found Belonging</h2>
          <button 
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-200/50 rounded-xl transition text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status lost/found toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Report Type</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'lost' }))}
                className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  formData.status === 'lost' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Lost Report
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'found' }))}
                className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  formData.status === 'found' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Found Report
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Lost iPhone 15 near Zoo, Found Silver Ring..."
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition text-sm bg-white"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-sm bg-white cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date {formData.status === 'lost' ? 'Lost' : 'Found'}</span>
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-sm bg-white cursor-pointer"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Campus Location</span>
            </label>
            <select
              name="location"
              value={LOCATIONS.includes(formData.location) ? formData.location : (formData.location === '' ? '' : 'Other')}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, location: val === 'Other' ? 'Other' : val }));
              }}
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-sm bg-white cursor-pointer"
            >
              <option value="">-- Select Location --</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
              <option value="Other">Other (Type custom location below)</option>
            </select>
            {(formData.location === 'Other' || (formData.location !== '' && !LOCATIONS.includes(formData.location))) && (
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Near Newman's Block Gym, Parking Lot Area"
                value={formData.location === 'Other' ? '' : formData.location}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition text-sm bg-white mt-2"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Description Details</span>
            </label>
            <textarea
              name="description"
              required
              rows="4"
              placeholder="Detail serial numbers, color markings, stickers, case models, content contents..."
              value={formData.description}
              onChange={handleInputChange}
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition text-sm bg-white resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attach Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-sky-500/50 transition relative bg-slate-50/50">
              <div className="space-y-1.5 text-center">
                {photoPreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-2xl shadow-sm border border-slate-100" 
                    />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <React.Fragment>
                    <Upload className="mx-auto h-10 w-10 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-semibold text-sky-600 hover:text-sky-700 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="photo" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP up to 5MB</p>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-100 transition"
            >
              {loading ? 'Submitting...' : 'Publish Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
