import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  MessageSquare,
  ChevronRight,
  FileSpreadsheet,
  BellRing
} from 'lucide-react';

const StudentDashboard = () => {
  const { apiCall } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [complaintsData, announcementsData] = await Promise.all([
        apiCall('/complaints/list'),
        apiCall('/announcements/')
      ]);
      setComplaints(complaintsData.complaints);
      setAnnouncements(announcementsData.announcements);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute counts
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50">
            <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title="Student Dashboard" />
        
        <main className="p-8 pt-24 space-y-8 max-w-7xl mx-auto">
          {/* Announcements Feed */}
          {announcements.length > 0 && (
            <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-200 dark:shadow-none text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white opacity-10 blur-2xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <BellRing className="w-5 h-5 text-indigo-200" />
                <h3 className="text-lg font-bold">Campus Announcements</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {announcements.map(ann => (
                  <div key={ann.id} className="min-w-[300px] max-w-[350px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 snap-start shrink-0">
                    <h4 className="font-bold text-white mb-2 line-clamp-1">{ann.title}</h4>
                    <p className="text-sm text-indigo-100 line-clamp-2">{ann.content}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-indigo-200 font-medium">
                      <span>{ann.author_name}</span>
                      <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/report-issue"
              className="flex items-center justify-between p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-100 hover:shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Report Campus Issue</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Submit classrooms, electrical, or leakage complaints</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link 
              to="/chatbot"
              className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Campus Chatbot</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ask questions about placements, courses, fees, or library</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Counts metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Issues</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{pendingCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">In Progress</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{inProgressCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resolved Issues</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{resolvedCount}</p>
              </div>
            </div>
          </div>

          {/* Complaints List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">My Submitted Complaints</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Track and view history of your reported campus problems.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-xs text-slate-400 mt-3">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">No complaints reported yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  If you notice any broken furniture, leaks, or maintenance issues on campus, feel free to report them.
                </p>
                <Link 
                  to="/report-issue" 
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  Report First Issue
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complaint ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Issue Title</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Submitted</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {complaints.map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => navigate(`/complaint/${c.id}`)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">{c.id}</td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs overflow-hidden">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{c.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.location}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {c.predicted_category || 'Unclassified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
