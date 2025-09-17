// src/components/client/Submissions.js
import React, { useState, useEffect } from 'react';
import { HiDocumentText, HiFilter, HiCheckCircle, HiXCircle, HiClock, HiEye, HiRefresh, HiExclamation } from 'react-icons/hi';
import { authAPI } from '../../services/api';
import api from '../../services/api'; // Import the configured axios instance

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) {
        throw new Error('Please log in to view submissions');
      }
      
      setUserProfile(currentUser);
      
      // Use the configured API instance instead of raw axios
      const response = await api.get(`/api/submissions/user/${currentUser._id}`);
      
      if (response.data.success) {
        setSubmissions(response.data.data || []);
      } else {
        throw new Error(response.data.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (err.response?.status === 404) {
        setError('Submissions API endpoint not found. Please ensure the backend server is running with the correct routes.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.message || 'Failed to load submissions');
      }
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions based on status and language
  useEffect(() => {
    let filtered = submissions;
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(submission => 
        getDisplayStatus(submission.status) === statusFilter
      );
    }
    
    if (languageFilter !== 'All') {
      filtered = filtered.filter(submission => 
        submission.language.toLowerCase() === languageFilter.toLowerCase()
      );
    }
    
    setFilteredSubmissions(filtered);
  }, [submissions, statusFilter, languageFilter]);

  // Fetch submissions on component mount
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Convert backend status to display status
  const getDisplayStatus = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'wrong_answer': return 'Wrong Answer';
      case 'compilation_error': return 'Compilation Error';
      case 'runtime_error': return 'Runtime Error';
      case 'time_limit_exceeded': return 'Time Limit Exceeded';
      case 'memory_limit_exceeded': return 'Memory Limit Exceeded';
      case 'pending': return 'Pending';
      case 'running': return 'Running';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'Accepted': return <HiCheckCircle className="text-green-400" />;
      case 'Wrong Answer': return <HiXCircle className="text-red-400" />;
      case 'Time Limit Exceeded': return <HiClock className="text-yellow-400" />;
      case 'Runtime Error': return <HiXCircle className="text-orange-400" />;
      case 'Compilation Error': return <HiXCircle className="text-red-400" />;
      case 'Memory Limit Exceeded': return <HiClock className="text-purple-400" />;
      case 'Pending': return <HiClock className="text-gray-400" />;
      case 'Running': return <HiClock className="text-blue-400" />;
      default: return <HiClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'Accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Wrong Answer': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Time Limit Exceeded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Runtime Error': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Compilation Error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Memory Limit Exceeded': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  const formatLanguage = (language) => {
    const langMap = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'ruby': 'Ruby',
      'php': 'PHP'
    };
    return langMap[language] || language;
  };

  const getProblemTitle = (problemId) => {
    // Convert problemId to readable title
    if (typeof problemId === 'string') {
      return problemId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return problemId || 'Unknown Problem';
  };

  // Get unique values for filters
  const statuses = ['All', ...new Set(submissions.map(s => getDisplayStatus(s.status)))];
  const languages = ['All', ...new Set(submissions.map(s => formatLanguage(s.language)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4 flex justify-center">
            <HiExclamation />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Submissions</h2>
          <p className="text-gray-300 text-lg mb-6">{error}</p>
          <div className="text-gray-400 text-sm mb-6">
            <p>Possible solutions:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Check if the backend server is running</li>
              <li>• Verify the submissions API endpoint exists</li>
              <li>• Ensure you are logged in with valid credentials</li>
              <li>• Check your network connection</li>
            </ul>
          </div>
          <button 
            onClick={fetchSubmissions}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 mx-auto"
          >
            <HiRefresh className="text-lg" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <HiDocumentText className="text-2xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">My Submissions</h1>
          <p className="text-gray-300 text-xl">Track your coding journey and progress</p>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiDocumentText className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Submissions Yet</h3>
            <p className="text-gray-400 mb-6">
              Start solving problems to see your submissions here!
            </p>
            <button 
              onClick={() => window.location.href = '/client/practice'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              Start Coding
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Submissions</p>
                    <p className="text-2xl font-bold text-white">{submissions.length}</p>
                  </div>
                  <HiDocumentText className="text-blue-400 text-2xl" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Accepted</p>
                    <p className="text-2xl font-bold text-green-400">
                      {submissions.filter(s => s.status === 'accepted').length}
                    </p>
                  </div>
                  <HiCheckCircle className="text-green-400 text-2xl" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {Math.round((submissions.filter(s => s.status === 'accepted').length / submissions.length) * 100)}%
                    </p>
                  </div>
                  <div className="text-yellow-400 text-2xl">📊</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length)}
                    </p>
                  </div>
                  <div className="text-purple-400 text-2xl">⭐</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <HiFilter className="text-blue-400 text-xl" />
                <h3 className="text-lg font-semibold text-white">Filter Submissions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white">
                  Submission History ({filteredSubmissions.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Language</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Submitted</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredSubmissions.map((submission) => {
                      const dateTime = formatDate(submission.submittedAt);
                      return (
                        <tr key={submission._id} className="hover:bg-white/5 transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">
                              {getProblemTitle(submission.problemId)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              <span>{getDisplayStatus(submission.status)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${(submission.score || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {submission.score || 0}
                              </span>
                              {(submission.score || 0) > 0 && (
                                <div className="w-12 bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${submission.score || 0}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-sm">
                              {formatLanguage(submission.language)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-300 text-sm">
                              <div>{dateTime.date}</div>
                              <div className="text-gray-400">{dateTime.time}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                              <HiEye className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiDocumentText className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Matching Submissions</h3>
                <p className="text-gray-400">
                  Try adjusting your filter criteria to see more submissions.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Submissions;
