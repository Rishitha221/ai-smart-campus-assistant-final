import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Upload, 
  MapPin, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  X
} from 'lucide-react';

const ReportIssue = () => {
  const { apiCall } = useState();
  const { apiCall: authApiCall } = useAuth(); // fetch wrapper
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success state to show AI categorization output
  const [submittedData, setSubmittedData] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Please upload a valid image file (PNG, JPG, JPEG).');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !location) {
      setError('Please fill in all fields (Title, Description, Location).');
      return;
    }

    setLoading(true);
    
    // Prepare multipart form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    if (image) {
      formData.append('image', image);
    }

    try {
      // Direct call using fetch since apiCall in context handles JSON body,
      // but we need multipart/form-data here. Let's make fetch call with token:
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/complaints/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      setSubmittedData(data.complaint);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Verify API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title="Report Campus Issue" />
        
        <main className="p-8 pt-24 max-w-4xl mx-auto">
          {submittedData ? (
            /* AI Classification Success Card */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 transition-all duration-300 animate-slide-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Issue Registered Successfully!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your complaint ID is <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-base">{submittedData.id}</strong>.
                </p>
              </div>

              {/* AI Categorizer Results */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/30 dark:bg-indigo-950/15 dark:border-indigo-950 text-left space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">AI Analysis Output</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Predicted Category</span>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white dark:bg-indigo-500">
                      {submittedData.predicted_category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Confidence Score</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white block mt-1">
                      {(submittedData.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  * Note: The issue category was automatically predicted using the Hugging Face CLIP Zero-Shot image classification model.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 transition-all"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/complaint/${submittedData.id}`)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  View Complaint Details
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl transition-all">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Submit Campus Complaint</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Describe the issue and upload an image. Our AI will automatically categorize it.</p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Fields */}
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Issue Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Broken wooden chair in classroom"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Location *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. CSE Block, Room 302"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Detailed Description *</label>
                      <div className="relative">
                        <span className="absolute top-3 left-3.5 text-slate-400">
                          <FileText className="h-4 w-4" />
                        </span>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the issue in detail. E.g. The back legs of the second chair in the third row are completely detached, posing a safety hazard."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column File Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Upload Issue Photo (Highly Recommended)</label>
                    
                    {imagePreview ? (
                      /* Image Preview Container */
                      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center h-[264px]">
                        <img 
                          src={imagePreview} 
                          alt="Issue Preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      /* Drag & Drop Area */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all h-[264px] ${
                          dragging 
                            ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-900/30'
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-3">
                          <Upload className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Drag & drop image here</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">or click to browse from device (PNG, JPG, JPEG)</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        AI Classifying Image...
                      </>
                    ) : (
                      <>
                        Submit & Classify Issue
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportIssue;
