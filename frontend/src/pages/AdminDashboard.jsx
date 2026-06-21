import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet,
  Edit,
  X,
  FileText,
  AlertTriangle,
  BellRing,
  BookOpen,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const { apiCall } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Status Change Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [remarks, setRemarks] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Announcement Modal state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [announcementsListLoading, setAnnouncementsListLoading] = useState(false);

  const fetchAnnouncementsList = async () => {
    setAnnouncementsListLoading(true);
    try {
      const data = await apiCall('/announcements/');
      setAnnouncementsList(data.announcements);
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setAnnouncementsListLoading(false);
    }
  };

  useEffect(() => {
    if (announcementModalOpen) {
      fetchAnnouncementsList();
    }
  }, [announcementModalOpen]);

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await apiCall(`/announcements/${id}`, { method: 'DELETE' });
      fetchAnnouncementsList(); // Refresh list
    } catch (err) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  // Academics Modal state
  const [academicsModalOpen, setAcademicsModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [academicsType, setAcademicsType] = useState('marks'); // 'marks' or 'attendance'
  const [academicsFormData, setAcademicsFormData] = useState({
    student_id: '',
    semester: 'Semester 4',
    subject: '',
    marks_obtained: '',
    max_marks: '100',
    total_classes: '',
    attended_classes: ''
  });
  const [academicsLoading, setAcademicsLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const endpoint = `/admin/complaints?status=${statusFilter}&category=${categoryFilter}&search=${searchQuery}`;
      const data = await apiCall(endpoint);
      setComplaints(data.complaints);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const endpoint = `/admin/complaints/export?status=${statusFilter}&category=${categoryFilter}`;
      const blob = await apiCall(endpoint);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Campus_Complaints_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export Excel report. Ensure pandas and openpyxl are installed on the backend.');
    } finally {
      setExportLoading(false);
    }
  };

  const openStatusModal = (complaint, e) => {
    e.stopPropagation(); // prevent row click navigation
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setRemarks('');
    setModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiCall(`/admin/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, remarks })
      });
      setModalOpen(false);
      fetchComplaints(); // reload complaints list
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    setAnnouncementLoading(true);
    try {
      await apiCall('/announcements/', {
        method: 'POST',
        body: JSON.stringify({ title: announcementTitle, content: announcementContent })
      });
      setAnnouncementModalOpen(false);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      alert('Announcement posted successfully!');
      fetchAnnouncementsList(); // Refresh list
    } catch (err) {
      alert(err.message || 'Failed to post announcement.');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleOpenAcademicsModal = async () => {
    setAcademicsModalOpen(true);
    try {
      const response = await apiCall('/academics/students');
      setStudentsList(response.students);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcademicsSubmit = async (e) => {
    e.preventDefault();
    setAcademicsLoading(true);
    try {
      const endpoint = academicsType === 'marks' ? '/academics/marks' : '/academics/attendance';
      await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(academicsFormData)
      });
      setAcademicsModalOpen(false);
      setAcademicsFormData({ ...academicsFormData, subject: '', marks_obtained: '', total_classes: '', attended_classes: '' });
      alert(`${academicsType === 'marks' ? 'Marks' : 'Attendance'} updated successfully!`);
    } catch (err) {
      alert(err.message || 'Failed to update academics.');
    } finally {
      setAcademicsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50">
            <AlertCircle className="h-3 w-3" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
            <CheckCircle2 className="h-3 w-3" />
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
        <Navbar title="Manage Complaints (Admin)" />
        
        <main className="p-8 pt-24 max-w-7xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Campus Issue Registry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">View, update, filter and export campus facility complaints.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleOpenAcademicsModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                Manage Academics
              </button>
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <BellRing className="h-4 w-4" />
                Post Announcement
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {exportLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Export filtered to Excel
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, title, student name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
              >
                <option value="">All AI Categories</option>
                <option value="Furniture Damage">Furniture Damage</option>
                <option value="Cleanliness Issue">Cleanliness Issue</option>
                <option value="Electrical Issue">Electrical Issue</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Maintenance Issue">Maintenance Issue</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-xs text-slate-400 mt-3">Loading complaints registry...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">No matching complaints found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Try adjusting your keywords or filters above to find specific complaints.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complaint ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title & Location</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Submitted</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Upvotes</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...complaints].sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0)).map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => navigate(`/complaint/${c.id}`)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">{c.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.student_name}</p>
                          <p className="text-xs text-slate-400 truncate">{c.student_email}</p>
                        </td>
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
                        <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {c.upvote_count || 0}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={(e) => openStatusModal(c, e)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                              title="Update Status"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Status update Modal */}
          {modalOpen && selectedComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-8 overflow-hidden relative animate-slide-in">
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Update Complaint Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Updating status of <strong className="text-indigo-600 dark:text-indigo-400">{selectedComplaint.id}</strong> ({selectedComplaint.title})
                </p>

                <form onSubmit={handleUpdateStatusSubmit} className="space-y-5">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Select Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Admin Remarks & Action Steps</label>
                    <textarea
                      rows={4}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Electrical team dispatched to replace light bulb. Resolved."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs dark:border-slate-800 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {modalLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : null}
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* Post Announcement Modal */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden transform scale-100 opacity-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-none">Post Campus Announcement</h3>
                  <p className="text-xs text-slate-500 mt-1">Broadcast important news to all students.</p>
                </div>
              </div>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleAnnouncementSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="E.g., College Fest Details, Holiday Notice"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Details / Content</label>
                <textarea
                  rows="4"
                  required
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Provide all the necessary details here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setAnnouncementModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={announcementLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none active:scale-95">
                  {announcementLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status update Modal */}
          {modalOpen && selectedComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-8 overflow-hidden relative animate-slide-in">
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Update Complaint Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Updating status of <strong className="text-indigo-600 dark:text-indigo-400">{selectedComplaint.id}</strong> ({selectedComplaint.title})
                </p>

                <form onSubmit={handleUpdateStatusSubmit} className="space-y-5">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Select Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Admin Remarks & Action Steps</label>
                    <textarea
                      rows={4}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Electrical team dispatched to replace light bulb. Resolved."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs dark:border-slate-800 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {modalLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : null}
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* Post Announcement Modal */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden transform scale-100 opacity-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-none">Manage Announcements</h3>
                  <p className="text-xs text-slate-500 mt-1">Broadcast important news to all students or remove old ones.</p>
                </div>
              </div>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleAnnouncementSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="E.g., College Fest Details, Holiday Notice"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Details / Content</label>
                <textarea
                  rows="4"
                  required
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Provide all the necessary details here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setAnnouncementModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={announcementLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none active:scale-95">
                  {announcementLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                  Post Announcement
                </button>
              </div>
            </form>

            {/* Existing Announcements List */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 max-h-[300px] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Past Announcements</h4>
              {announcementsListLoading ? (
                <div className="text-center py-4 text-xs text-slate-500">Loading announcements...</div>
              ) : announcementsList.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">No past announcements.</div>
              ) : (
                <div className="space-y-3">
                  {announcementsList.map(ann => (
                    <div key={ann.id} className="flex items-start justify-between gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-white truncate">{ann.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{ann.content}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manage Academics Modal */}
      {academicsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden transform scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-none">Manage Academics</h3>
                  <p className="text-xs text-slate-500 mt-1">Update student marks and attendance.</p>
                </div>
              </div>
              <button onClick={() => setAcademicsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleAcademicsSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Update Type</label>
                <select
                  value={academicsType}
                  onChange={(e) => setAcademicsType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                >
                  <option value="marks">Marks</option>
                  <option value="attendance">Attendance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Student</label>
                <select
                  required
                  value={academicsFormData.student_id}
                  onChange={(e) => setAcademicsFormData({...academicsFormData, student_id: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                >
                  <option value="">Select a Student...</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.username})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Semester</label>
                <input
                  type="text"
                  required
                  value={academicsFormData.semester}
                  onChange={(e) => setAcademicsFormData({...academicsFormData, semester: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                />
              </div>

              {academicsType === 'marks' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      required
                      value={academicsFormData.subject}
                      onChange={(e) => setAcademicsFormData({...academicsFormData, subject: e.target.value})}
                      placeholder="e.g. Mathematics"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Marks Obtained</label>
                      <input
                        type="number"
                        required
                        value={academicsFormData.marks_obtained}
                        onChange={(e) => setAcademicsFormData({...academicsFormData, marks_obtained: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Max Marks</label>
                      <input
                        type="number"
                        required
                        value={academicsFormData.max_marks}
                        onChange={(e) => setAcademicsFormData({...academicsFormData, max_marks: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Attended Classes</label>
                    <input
                      type="number"
                      required
                      value={academicsFormData.attended_classes}
                      onChange={(e) => setAcademicsFormData({...academicsFormData, attended_classes: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Total Classes</label>
                    <input
                      type="number"
                      required
                      value={academicsFormData.total_classes}
                      onChange={(e) => setAcademicsFormData({...academicsFormData, total_classes: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                <button type="button" onClick={() => setAcademicsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={academicsLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-orange-200 dark:shadow-none active:scale-95">
                  {academicsLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
