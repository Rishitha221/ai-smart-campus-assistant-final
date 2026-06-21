import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BookOpen, GraduationCap, Percent, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Academics = () => {
  const { apiCall } = useAuth();
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      const [marksData, attendanceData] = await Promise.all([
        apiCall('/academics/marks'),
        apiCall('/academics/attendance')
      ]);
      setMarks(marksData.marks);
      setAttendance(attendanceData.attendance);
    } catch (err) {
      console.error("Failed to load academic data:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentSemester = "Semester 4"; // In a real app, this could be dynamic

  const filteredMarks = marks.filter(m => m.semester === currentSemester);
  const filteredAttendance = attendance.find(a => a.semester === currentSemester);

  const chartData = {
    labels: filteredMarks.map(m => m.subject),
    datasets: [
      {
        label: 'Marks Obtained',
        data: filteredMarks.map(m => m.marks_obtained),
        backgroundColor: 'rgba(79, 70, 229, 0.8)', // indigo-600
        borderRadius: 8,
      },
      {
        label: 'Max Marks',
        data: filteredMarks.map(m => m.max_marks),
        backgroundColor: 'rgba(203, 213, 225, 0.5)', // slate-300
        borderRadius: 8,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar title="Academics" />
        
        <main className="flex-1 p-8 pt-24 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Performance</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your marks, grades, and attendance for {currentSemester}.</p>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Overview Cards */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Attendance Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-indigo-100 font-medium text-sm">Overall Attendance</p>
                      <h3 className="text-4xl font-extrabold mt-1">{filteredAttendance ? filteredAttendance.percentage : 0}%</h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Percent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {filteredAttendance && (
                    <div className="mt-6 flex justify-between text-sm font-medium text-indigo-100">
                      <span>{filteredAttendance.attended_classes} Classes Attended</span>
                      <span>Out of {filteredAttendance.total_classes}</span>
                    </div>
                  )}
                </div>

                {/* Performance Summary */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Marks Summary</h3>
                  </div>
                  
                  {filteredMarks.length === 0 ? (
                    <p className="text-slate-500 text-sm">No marks recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredMarks.map(mark => (
                        <div key={mark.id}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{mark.subject}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{mark.marks_obtained} / {mark.max_marks}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${(mark.marks_obtained / mark.max_marks) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Area */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Subject Wise Performance</h3>
                </div>
                
                {filteredMarks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                    <GraduationCap className="w-16 h-16 opacity-30 mb-4" />
                    <p>Marks data will appear here once updated by the admin.</p>
                  </div>
                ) : (
                  <div className="flex-1 w-full relative min-h-[300px]">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Academics;
