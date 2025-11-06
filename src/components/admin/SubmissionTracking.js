// src/components/admin/SubmissionTracking.js
import React, { useState, useEffect } from 'react';
import { HiChartBar, HiFilter, HiCheckCircle, HiXCircle, HiClock, HiExclamationCircle, HiRefresh, HiArrowLeft, HiCode, HiX } from 'react-icons/hi';
import api, { submissionsAPI } from '../../services/api';

const SubmissionTracking = ({ onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state for viewing code
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  
  // Filter states
  const [selectedProblem, setSelectedProblem] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch submissions data
  useEffect(() => {
    fetchSubmissions();
    fetchProblems();
    fetchUsers();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching submissions...');
      
      const response = await submissionsAPI.getAllSubmissions({
        page: 1,
        limit: 100 // Get more data for better analytics
      });
      
      console.log('📊 Submissions response:', response);
      
      if (response.success) {
        const allSubs = response.data || [];
        setSubmissions(allSubs);
        
        // Count practice vs contest submissions
        const practiceCount = allSubs.filter(s => !s.contestId).length;
        const contestCount = allSubs.filter(s => s.contestId).length;
        
        console.log(`✅ Loaded ${allSubs.length} total submissions`);
        console.log(`📝 Practice submissions (contestId: null): ${practiceCount}`);
        console.log(`🏆 Contest submissions (contestId: set): ${contestCount}`);
        console.log('📊 Submission Tracking will show ONLY practice submissions');
      } else {
        throw new Error(response.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      console.error('❌ Error fetching submissions:', err);
      setError(`Failed to load submissions: ${err.message}`);
      // Don't set empty array, keep existing data
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      console.log('🔄 Fetching problems...');
      const response = await api.get('/api/problems');
      
      if (response.data.success) {
        setProblems(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} problems`);
      } else {
        console.warn('⚠️ Problems API returned unsuccessful response');
        setError('Failed to load problems data');
      }
    } catch (err) {
      console.error('❌ Error fetching problems:', err);
      setError('Failed to load problems data');
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users...');
      const response = await api.get('/users');
      
      if (response.data.success) {
        setUsers(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} users`);
      } else {
        console.warn('⚠️ Users API returned unsuccessful response');
        setError('Failed to load users data');
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError('Failed to load users data');
    }
  };

  // Function to fetch detailed submission with code
  const fetchSubmissionDetails = async (submissionId) => {
    try {
      setLoadingCode(true);
      const response = await submissionsAPI.getSubmissionById(submissionId);
      
      if (response.success) {
        setSelectedSubmission(response.data);
        setShowCodeModal(true);
      } else {
        setError('Failed to load submission details');
      }
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError('Failed to load submission details');
    } finally {
      setLoadingCode(false);
    }
  };

  // Function to handle view code button click
  const handleViewCode = (submission) => {
    // If the submission already has code data, show it directly
    if (submission.code) {
      setSelectedSubmission(submission);
      setShowCodeModal(true);
    } else {
      // Otherwise fetch the full submission details
      fetchSubmissionDetails(submission._id);
    }
  };

  // Function to close code modal
  const closeCodeModal = () => {
    setShowCodeModal(false);
    setSelectedSubmission(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <HiCheckCircle className="text-green-400" />;
      case 'wrong_answer': return <HiXCircle className="text-red-400" />;
      case 'compilation_error': return <HiExclamationCircle className="text-orange-400" />;
      case 'runtime_error': return <HiExclamationCircle className="text-red-400" />;
      case 'time_limit_exceeded': return <HiClock className="text-yellow-400" />;
      case 'memory_limit_exceeded': return <HiExclamationCircle className="text-purple-400" />;
      case 'pending': 
      case 'running': return <HiClock className="text-blue-400" />;
      default: return <HiClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'wrong_answer': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'compilation_error': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'runtime_error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'time_limit_exceeded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'memory_limit_exceeded': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pending':
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'wrong_answer': return 'Wrong Answer';
      case 'compilation_error': return 'Compilation Error';
      case 'runtime_error': return 'Runtime Error';
      case 'time_limit_exceeded': return 'Time Limit Exceeded';
      case 'memory_limit_exceeded': return 'Memory Limit Exceeded';
      case 'pending': return 'Pending';
      case 'running': return 'Running';
      default: return status;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProblemTitle = (problemId) => {
    if (!problemId) {
      return 'Unknown Problem';
    }
    
    const problem = problems.find(p => p._id === problemId);
    return problem ? problem.title : `Problem ${typeof problemId === 'string' ? problemId.slice(-6) : 'Unknown'}`;
  };

  const getUserDisplay = (userId) => {
    // Handle case where userId is already a user object with username
    if (typeof userId === 'object' && userId && userId.username) {
      return userId.username;
    }
    
    // Handle case where userId is null or undefined
    if (!userId) {
      return 'Unknown User';
    }
    
    // Find user by ID
    const user = users.find(u => u._id === userId);
    
    // Return username if user found, otherwise return a fallback
    if (user && user.username) {
      return user.username;
    }
    
    // Fallback for when user is not found
    return `User ${typeof userId === 'string' ? userId.slice(-6) : 'Unknown'}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown Date';
    
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getLanguageDisplayName = (language) => {
    if (!language) return 'Unknown';
    
    const languageMap = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'cpp': 'C++',
      'java': 'Java',
      'c': 'C',
      'go': 'Go',
      'ruby': 'Ruby',
      'php': 'PHP'
    };
    return languageMap[language] || language.charAt(0).toUpperCase() + language.slice(1);
  };

  // Filter submissions with null safety
  // ONLY show practice submissions (contestId is null or undefined)
  const filteredSubmissions = submissions.filter(submission => {
    if (!submission) return false;
    
    // First filter: ONLY include submissions where contestId is null/undefined (practice submissions)
    // Exclude all contest submissions
    if (submission.contestId !== null && submission.contestId !== undefined) {
      console.log(`🚫 Excluding contest submission ${submission._id} (contestId: ${submission.contestId})`);
      return false; // Skip contest submissions
    }
    
    const matchesProblem = selectedProblem === 'All' || submission.problemId === selectedProblem;
    const matchesStatus = statusFilter === 'All' || submission.status === statusFilter;
    
    // Enhanced user matching with null safety
    let matchesUser = true;
    if (selectedUser !== 'All') {
      if (typeof submission.userId === 'object' && submission.userId) {
        matchesUser = submission.userId._id === selectedUser;
      } else if (submission.userId) {
        matchesUser = submission.userId === selectedUser;
      } else {
        matchesUser = false;
      }
    }
    
    let matchesDate = true;
    if (dateRange !== 'All' && submission.submittedAt) {
      try {
        const submissionDate = new Date(submission.submittedAt);
        const now = new Date();
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        matchesDate = submissionDate >= cutoffDate;
      } catch (err) {
        matchesDate = true; // If date parsing fails, include the submission
      }
    }
    
    return matchesProblem && matchesStatus && matchesUser && matchesDate;
  });

  // Get only the most recent submission for each problem
  const latestSubmissionsMap = new Map();
  filteredSubmissions.forEach(submission => {
    if (!submission || !submission.problemId) return;
    
    const problemId = submission.problemId;
    const existing = latestSubmissionsMap.get(problemId);
    
    if (!existing || new Date(submission.submittedAt) > new Date(existing.submittedAt)) {
      latestSubmissionsMap.set(problemId, submission);
    }
  });
  
  // Convert map back to array and sort by submission date (most recent first)
  const latestSubmissions = Array.from(latestSubmissionsMap.values())
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  // Pagination - use latestSubmissions instead of filteredSubmissions
  const totalPages = Math.ceil(latestSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = latestSubmissions.slice(startIndex, startIndex + itemsPerPage);

  // Statistics with null safety - calculate from latestSubmissions
  const stats = {
    total: latestSubmissions.length,
    accepted: latestSubmissions.filter(s => s && s.status === 'accepted').length,
    failed: latestSubmissions.filter(s => s && s.status && s.status !== 'accepted' && s.status !== 'pending' && s.status !== 'running').length,
    pending: latestSubmissions.filter(s => s && (s.status === 'pending' || s.status === 'running')).length,
    avgScore: latestSubmissions.length > 0 ? 
      Math.round(latestSubmissions.reduce((acc, s) => acc + (s?.score || 0), 0) / latestSubmissions.length) : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button and Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors mr-6"
          >
            <HiArrowLeft className="text-xl" />
            <span className="text-lg">Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-4">
            <HiChartBar className="text-2xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Practice Submission Analytics</h1>
          <p className="text-gray-300 text-lg">Monitor and analyze student practice problem submissions</p>
          <p className="text-gray-400 text-sm mt-2">
            📝 Showing only practice submissions (Contest submissions are in Contest Analysis)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => { 
                  setError(null); 
                  fetchSubmissions(); 
                  fetchProblems();
                  fetchUsers();
                }}
                className="text-red-400 hover:text-red-300"
              >
                <HiRefresh className="text-lg" />
              </button>
            </div>
          </div>
        )}

        {/* Show message if no data is available */}
        {!loading && (submissions.length === 0 || problems.length === 0 || users.length === 0) && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center mb-8">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiExclamationCircle className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
            <p className="text-gray-400 mb-6">
              {submissions.length === 0 && "No submissions found. "}
              {problems.length === 0 && "No problems found. "}
              {users.length === 0 && "No users found. "}
              Please check your API endpoints.
            </p>
            <button
              onClick={() => {
                setError(null);
                fetchSubmissions();
                fetchProblems();
                fetchUsers();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry Loading Data
            </button>
          </div>
        )}

        {/* Only show filters and content if we have data */}
        {!loading && submissions.length > 0 && problems.length > 0 && users.length > 0 && (
          <>
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
              {/* Filter Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <HiFilter className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-white">Filter Submissions</h3>
              </div>
              
              {/* Filter Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Problem Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Problem
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedProblem}
                      onChange={(e) => setSelectedProblem(e.target.value)}
                      className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl px-4 py-3.5 text-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-300 hover:bg-gray-800/80 appearance-none cursor-pointer"
                    >
                      <option value="All">All Problems</option>
                      {problems.map((problem) => (
                        <option key={problem._id} value={problem._id}>{problem.title}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Status
                  </label>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl px-4 py-3.5 text-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-300 hover:bg-gray-800/80 appearance-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="accepted">✅ Accepted</option>
                      <option value="wrong_answer">❌ Wrong Answer</option>
                      <option value="compilation_error">⚠️ Compilation Error</option>
                      <option value="runtime_error">💥 Runtime Error</option>
                      <option value="time_limit_exceeded">⏰ Time Limit Exceeded</option>
                      <option value="memory_limit_exceeded">🧠 Memory Limit Exceeded</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="running">🔄 Running</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Student Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Student
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl px-4 py-3.5 text-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-300 hover:bg-gray-800/80 appearance-none cursor-pointer"
                    >
                      <option value="All">All Students</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.username} {user.name && `- ${user.name}`}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Date Range
                  </label>
                  <div className="relative">
                    <select 
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl px-4 py-3.5 text-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-300 hover:bg-gray-800/80 appearance-none cursor-pointer"
                    >
                      <option value="All">All Time</option>
                      <option value="1">📅 Last 24 hours</option>
                      <option value="7">📅 Last 7 days</option>
                      <option value="30">📅 Last 30 days</option>
                      <option value="90">📅 Last 90 days</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    {latestSubmissions.length} problems with latest submissions
                  </span>
                  {(selectedProblem !== 'All' || statusFilter !== 'All' || selectedUser !== 'All' || dateRange !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedProblem('All');
                        setStatusFilter('All');
                        setSelectedUser('All');
                        setDateRange('All');
                        setCurrentPage(1);
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => { 
                    setError(null); 
                    fetchSubmissions();
                    fetchProblems();
                    fetchUsers();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 
                           border border-blue-500/30 text-blue-400 rounded-xl transition-all duration-300 
                           hover:scale-105 active:scale-95"
                >
                  <HiRefresh className="text-lg" />
                  <span className="font-medium">Refresh</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              {[
                { label: 'Total Submissions', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: HiChartBar },
                { label: 'Accepted', value: stats.accepted, color: 'from-green-500 to-emerald-500', icon: HiCheckCircle },
                { label: 'Failed', value: stats.failed, color: 'from-red-500 to-pink-500', icon: HiXCircle },
                { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-orange-500', icon: HiClock },
                { label: 'Avg Score', value: `${stats.avgScore}%`, color: 'from-purple-500 to-indigo-500', icon: HiChartBar }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Submissions Table */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/20 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Latest Submission per Problem
                </h2>
                <span className="text-gray-400 text-sm">
                  {latestSubmissions.length} problems
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Test Cases</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Language</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Submitted</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedSubmissions.map((submission) => {
                      // Skip rendering if submission is null/undefined
                      if (!submission) return null;
                      
                      return (
                        <tr key={submission._id} className="hover:bg-white/5 transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {getUserDisplay(submission.userId).slice(-2)}
                                </span>
                              </div>
                              <span className="text-white font-medium">{getUserDisplay(submission.userId)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{getProblemTitle(submission.problemId)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              <span className="text-sm font-medium">{getStatusDisplayName(submission.status)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${getScoreColor(submission.score || 0)}`}>
                                {submission.score || 0}%
                              </span>
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    (submission.score || 0) >= 70 ? 'bg-green-500' : 
                                    (submission.score || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${submission.score || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">
                              {submission.passedTestCases || 0}/{submission.totalTestCases || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">{getLanguageDisplayName(submission.language)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">{formatDate(submission.submittedAt)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewCode(submission)}
                              disabled={loadingCode}
                              className="flex items-center space-x-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 
                                       border border-indigo-500/30 text-indigo-400 rounded-lg transition-all duration-300 
                                       hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <HiCode className="text-sm" />
                              <span className="text-sm font-medium">
                                {loadingCode ? 'Loading...' : 'View Code'}
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-white/20 flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, latestSubmissions.length)} of {latestSubmissions.length} problems
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Code Modal */}
        {showCodeModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <HiCode className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Submission Code
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span>Student: {getUserDisplay(selectedSubmission.userId)}</span>
                      <span>•</span>
                      <span>Problem: {getProblemTitle(selectedSubmission.problemId)}</span>
                      <span>•</span>
                      <span>Language: {getLanguageDisplayName(selectedSubmission.language)}</span>
                      <span>•</span>
                      <span className={getScoreColor(selectedSubmission.score || 0)}>
                        Score: {selectedSubmission.score || 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeCodeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-auto">
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-700 border-b border-gray-600">
                    <span className="text-sm font-medium text-gray-300">
                      {getLanguageDisplayName(selectedSubmission.language)} Code
                    </span>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusIcon(selectedSubmission.status)}
                      <span className="text-xs font-medium">{getStatusDisplayName(selectedSubmission.status)}</span>
                    </div>
                  </div>
                  <pre className="p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    <code>{selectedSubmission.code || 'Code not available'}</code>
                  </pre>
                </div>

                {/* Additional Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Test Cases</h4>
                    <p className="text-lg font-bold text-white">
                      {selectedSubmission.passedTestCases || 0}/{selectedSubmission.totalTestCases || 0}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Submitted</h4>
                    <p className="text-sm text-white">
                      {formatDate(selectedSubmission.submittedAt)}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Status</h4>
                    <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full border ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusIcon(selectedSubmission.status)}
                      <span className="text-xs font-medium">{getStatusDisplayName(selectedSubmission.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
                <button
                  onClick={closeCodeModal}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionTracking;
