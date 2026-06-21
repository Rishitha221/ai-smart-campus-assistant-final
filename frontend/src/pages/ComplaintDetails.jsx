import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle,
  AlertTriangle,
  User as UserIcon,
  Calendar
} from 'lucide-react';

const ComplaintDetails = () => {
  const { complaintId } = useParams();
  const { apiCall } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      const data = await apiCall(`/complaints/${complaintId}`);
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const blob = await apiCall(`/complaints/${complaintId}/pdf`);
      
      // Create a URL and click a hidden anchor tag to trigger browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Complaint_Report_${complaintId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF report. Ensure the ReportLab library is working on the backend.');
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title={`Complaint ${complaintId}`} />
        
        <main className="p-8 pt-24 max-w-5xl mx-auto space-y-6">
          {/* Back Navigation & PDF Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            
            {complaint && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 font-bold text-xs dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {pdfLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent"></div>
                ) : (
                  <FileText className="h-4 w-4 text-red-500" />
                )}
                Download PDF Report
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-xs text-slate-400 mt-3">Loading details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center px-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
              <h4 className="font-bold text-slate-800 dark:text-white">Error Loading details</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Complaint General Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
                  {/* Status Badge & Title */}
                  <div className="space-y-3">
                    <span className={`inline-block border px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white leading-snug">{complaint.title}</h2>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase">Location</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        {complaint.location}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase">Date Submitted</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                        {new Date(complaint.created_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 text-sm">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase block">Detailed Description</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Image Attachment */}
                  {complaint.image_path && (
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase block">Photo Attachment</span>
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 flex justify-center max-h-[300px]">
                        <img 
                          src={complaint.image_path.startsWith('http') ? complaint.image_path : `http://localhost:5000${complaint.image_path}`} 
                          alt={complaint.title} 
                          className="max-h-[300px] object-contain w-auto hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: AI Analysis & Status Timeline */}
              <div className="space-y-6">
                {/* AI Box */}
                {complaint.predicted_category && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wider">AI Classification</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Predicted Category</span>
                        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white dark:bg-indigo-500">
                          {complaint.predicted_category}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Confidence Score</span>
                        <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                          {(complaint.confidence_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                    Activity Timeline
                  </h4>

                  {/* Vertical Timeline Nodes */}
                  <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                    {complaint.history.map((hist, idx) => (
                      <div key={hist.id} className="flex gap-4 relative animate-fade-in">
                        {/* Timeline Node Ring */}
                        <div className={`mt-1 h-6 w-6 rounded-full border-2 shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10 ${
                          hist.status === 'Resolved' 
                            ? 'border-emerald-500 text-emerald-500' 
                            : hist.status === 'In Progress'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-amber-500 text-amber-500'
                        }`}>
                          {hist.status === 'Resolved' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              hist.status === 'In Progress' ? 'bg-blue-500 animate-ping' : 'bg-amber-500'
                            }`}></div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">Status: {hist.status}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 leading-relaxed">
                            {hist.remarks}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
                            <UserIcon className="h-3 w-3" />
                            <span>By: {hist.updated_by_name}</span>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(hist.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                              {new Date(hist.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Helper inside script to align matching styles
const getStatusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50';
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export default ComplaintDetails;
