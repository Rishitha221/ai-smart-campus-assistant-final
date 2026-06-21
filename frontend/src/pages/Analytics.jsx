import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  BarChart2, 
  MessageSquare, 
  Users, 
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListCollapse
} from 'lucide-react';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { apiCall } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const resData = await apiCall('/admin/analytics');
      setData(resData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Sidebar />
        <div className="pl-64">
          <Navbar title="Campus Analytics" />
          <div className="flex flex-col items-center justify-center py-40">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-xs text-slate-400 mt-3">Computing analytics dashboards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Sidebar />
        <div className="pl-64">
          <Navbar title="Campus Analytics" />
          <div className="flex flex-col items-center justify-center py-40">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Error Loading Analytics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{error || 'Data is unavailable'}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Prepare Charts Datasets ---
  
  // 1. Doughnut Chart: Categories Distribution
  const doughnutData = {
    labels: Object.keys(data.categories),
    datasets: [
      {
        label: 'Number of Issues',
        data: Object.values(data.categories),
        backgroundColor: [
          'rgba(239, 68, 68, 0.75)',   // Red for Furniture Damage
          'rgba(168, 85, 247, 0.75)',  // Purple for Cleanliness
          'rgba(245, 158, 11, 0.75)',  // Amber for Electrical
          'rgba(59, 130, 246, 0.75)',  // Blue for Water Leakage
          'rgba(99, 102, 241, 0.75)',  // Indigo for Maintenance
        ],
        borderColor: [
          '#ef4444',
          '#a855f7',
          '#f59e0b',
          '#3b82f6',
          '#6366f1',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Outfit, sans-serif' },
          color: document.body.classList.contains('dark') ? '#cbd5e1' : '#334155'
        }
      }
    }
  };

  // 2. Line Chart: Monthly Trends
  const lineData = {
    labels: data.trends.labels.length > 0 ? data.trends.labels : ['No Data'],
    datasets: [
      {
        label: 'Issues Submitted',
        data: data.trends.values.length > 0 ? data.trends.values : [0],
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#4f46e5',
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointHoverRadius: 6,
        borderWidth: 2.5
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 10, family: 'Outfit, sans-serif' },
          color: document.body.classList.contains('dark') ? '#64748b' : '#94a3b8'
        },
        grid: { color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
      },
      x: {
        ticks: {
          font: { size: 10, family: 'Outfit, sans-serif' },
          color: document.body.classList.contains('dark') ? '#64748b' : '#94a3b8'
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title="Campus System Analytics" />
        
        <main className="p-8 pt-24 space-y-8 max-w-7xl mx-auto">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                <ListCollapse className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Complaints</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.counts.total}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending Approval</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.counts.pending}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">In Resolution</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.counts.inProgress}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Resolved Issues</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.counts.resolved}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Trend Chart (Line) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-3 space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Complaint Trend Timeline</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Monthly submission metrics over the last active months.</p>
              </div>
              <div className="h-64 relative">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Category breakdown (Doughnut) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">AI Category Breakdown</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Automatic predicted categories share distribution.</p>
              </div>
              <div className="h-64 relative">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Chatbot Analytics Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">AI Chatbot Metrics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center gap-4 border border-slate-100 dark:border-slate-800/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Total Conversations</span>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.chatbot.totalConversations}</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center gap-4 border border-slate-100 dark:border-slate-800/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Active Chat Users</span>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.chatbot.activeUsers}</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center gap-4 border border-slate-100 dark:border-slate-800/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Avg Messages per Student</span>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{data.chatbot.averageMessagesPerUser}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
