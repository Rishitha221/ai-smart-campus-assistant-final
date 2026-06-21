import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ThumbsUp, MapPin, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityIssues = () => {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCommunityComplaints();
  }, []);

  const fetchCommunityComplaints = async () => {
    try {
      const response = await fetch('/api/complaints/community', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error("Failed to load community complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (complaintId) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Update local state instantly to reflect the new upvote count
        setComplaints(prev => prev.map(c => {
          if (c.id === complaintId) {
            // Assume if it changed, we toggle. For perfection, we can just refetch or use the exact count.
            return { ...c, upvote_count: data.upvotes };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComplaints = complaints
    .filter(c => filter === 'all' || c.status === filter)
    .sort((a, b) => b.upvote_count - a.upvote_count); // Sort by most upvoted

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Navbar title="Community Issues" />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Community Feed</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">See issues reported around campus. Upvote issues that affect you to raise their priority!</p>
            </div>

            <div className="flex gap-2">
              {['all', 'Pending', 'In Progress', 'Resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {status === 'all' ? 'All Issues' : status}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No issues found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map(complaint => (
                  <div key={complaint.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-6 items-start hover:shadow-md transition-shadow">
                    
                    {/* Upvote Column */}
                    <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => handleUpvote(complaint.id)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        <ThumbsUp className="w-6 h-6" />
                      </button>
                      <span className="font-bold text-lg text-slate-800 dark:text-white">{complaint.upvote_count || 0}</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <Link to={`/complaint/${complaint.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{complaint.title}</h3>
                        </Link>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${
                          complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">{complaint.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {complaint.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {new Date(complaint.created_at).toLocaleDateString()}</span>
                        {complaint.predicted_category && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">AI: {complaint.predicted_category}</span>
                        )}
                      </div>
                    </div>

                    {/* Image Thumbnail */}
                    {complaint.image_path && (
                      <div className="w-24 h-24 hidden sm:block rounded-xl overflow-hidden shrink-0">
                        <img src={complaint.image_path} alt="Issue" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityIssues;
