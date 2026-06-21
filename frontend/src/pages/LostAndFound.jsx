import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Camera, Search, Filter, Plus, Clock, Tag, X, User } from 'lucide-react';

const LostAndFound = () => {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, lost, found
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    item_type: 'lost',
    title: '',
    description: '',
    image: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/lost-found/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch lost and found items", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('item_type', formData.item_type);
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await fetch('/api/lost-found/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message);
      
      setSuccess(result.message);
      setFormData({ item_type: 'lost', title: '', description: '', image: null });
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      const response = await fetch(`/api/lost-found/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.item_type === filter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Navbar title="Lost & Found" />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Campus Lost & Found</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Report lost items or post things you've found.</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Report Item
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'lost', 'found'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === type 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {type} Items
                </button>
              ))}
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No items found matching this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Camera className="w-10 h-10 opacity-50" />
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide backdrop-blur-md ${
                        item.item_type === 'lost' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
                      }`}>
                        {item.item_type}
                      </div>
                      {item.status !== 'Active' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <span className="px-4 py-2 bg-white/10 rounded-xl text-white font-bold tracking-widest uppercase border border-white/20">
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">{item.title}</h3>
                      </div>
                      
                      {item.ai_category && item.ai_category !== 'Uncategorized' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-md w-fit mb-3">
                          <Tag className="w-3 h-3" /> AI Tag: {item.ai_category}
                        </span>
                      )}
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">{item.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {item.user_name}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      {(user.id === item.user_id || user.role === 'admin') && item.status === 'Active' && (
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(item.id, item.item_type === 'lost' ? 'Found' : 'Claimed')}
                            className="flex-1 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            Mark as {item.item_type === 'lost' ? 'Found' : 'Claimed'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Report Item</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Item Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="item_type" value="lost" checked={formData.item_type === 'lost'} onChange={(e) => setFormData({...formData, item_type: e.target.value})} className="text-indigo-600" />
                    <span className="text-sm dark:text-slate-300">I lost something</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="item_type" value="found" checked={formData.item_type === 'found'} onChange={(e) => setFormData({...formData, item_type: e.target.value})} className="text-indigo-600" />
                    <span className="text-sm dark:text-slate-300">I found something</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="E.g., Blue Backpack, Keys" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description & Location</label>
                <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Describe the item and where it was lost/found..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Photo (Optional but helpful)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer" />
                <p className="text-xs text-slate-500 mt-1.5">Our AI will automatically tag the image category!</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostAndFound;
