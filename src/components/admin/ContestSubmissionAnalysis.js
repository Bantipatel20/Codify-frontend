// src/components/admin/ContestSubmissionAnalysis.js
import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiSearch, HiCode, HiCheckCircle, HiXCircle, HiClock, HiChartBar, HiDownload } from 'react-icons/hi';
import { contestAPI, submissionsAPI, userAPI, problemsAPI } from '../../services/api';

const ContestSubmissionAnalysis = ({ onBack }) => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [latestSubmissions, setLatestSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  
  // Statistics
  const [statistics, setStatistics] = useState({
    totalParticipants: 0,
    totalSubmissions: 0,
    uniqueProblems: 0,
    successRate: 0,
    averageScore: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getAllContests({ limit: 1000 });
      if (response.success) {
        // Filter to only Active and Completed contests
        const relevantContests = response.data.filter(
          contest => contest.status === 'Active' || contest.status === 'Completed'
        );
        setContests(relevantContests);
      } else {
        setError('Failed to fetch contests');
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  const fetchContestSubmissions = async (contestId) => {
    try {
      setAnalysisLoading(true);
      setError('');
      
      console.log('=== FETCHING CONTEST SUBMISSIONS ===');
      console.log('Contest ID:', contestId);
      console.log('Contest ID type:', typeof contestId);
      
      // Fetch ALL submissions (ignore backend filtering)
      // We'll filter on the frontend to diagnose the issue
      const response = await submissionsAPI.getAllSubmissions({ 
        limit: 10000 
        // Temporarily removed contestId parameter to fetch ALL submissions
        // This helps diagnose if backend filtering is the issue
      });

      console.log('API Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data length:', response.data?.length);

      if (response.success) {
        let allSubmissions = response.data || [];
        
        // Debug: Log first few submissions to check data structure
        if (allSubmissions.length > 0) {
          console.log('=== SAMPLE SUBMISSIONS ===');
          console.log('First submission:', JSON.stringify(allSubmissions[0], null, 2));
          console.log('userId type:', typeof allSubmissions[0].userId);
          console.log('userId value:', allSubmissions[0].userId);
          console.log('problemId type:', typeof allSubmissions[0].problemId);
          console.log('problemId value:', allSubmissions[0].problemId);
          console.log('contestId in submission:', allSubmissions[0].contestId);
          console.log('contestId type:', typeof allSubmissions[0].contestId);
          
          if (allSubmissions.length > 1) {
            console.log('Second submission userId:', allSubmissions[1].userId);
            console.log('Second submission contestId:', allSubmissions[1].contestId);
          }
          
          // Log all unique contestIds to see what's in the data
          const uniqueContestIds = [...new Set(allSubmissions.map(s => {
            if (!s.contestId) return 'NULL';
            if (typeof s.contestId === 'string') return s.contestId;
            if (s.contestId._id) return s.contestId._id;
            return 'UNKNOWN';
          }))];
          console.log('Unique contestIds in submissions:', uniqueContestIds);
          console.log('Looking for contestId:', contestId);
          
          // Filter submissions to only include those from this contest
          // Exclude submissions with null/undefined contestId (practice submissions)
          const contestSubmissions = allSubmissions.filter(sub => {
            // First check if contestId exists and is not null
            if (!sub.contestId) {
              console.log(`⏭️ Skipping submission ${sub._id} - contestId is null (practice submission)`);
              return false; // Skip practice submissions (contestId is null)
            }
            
            const subContestId = sub.contestId?._id || sub.contestId;
            const matches = String(subContestId) === String(contestId);
            
            if (!matches) {
              console.log(`⏭️ Skipping submission ${sub._id} with contestId ${subContestId} (looking for ${contestId})`);
            } else {
              console.log(`✅ Including submission ${sub._id} with matching contestId ${subContestId}`);
            }
            
            return matches;
          });
          
          console.log(`🎯 Filtered ${contestSubmissions.length} contest submissions for contest ${contestId} from ${allSubmissions.length} total submissions`);
          console.log(`❌ Excluded ${allSubmissions.length - contestSubmissions.length} submissions (practice or other contests)`);
          
          allSubmissions = contestSubmissions;
        }
        
        if (allSubmissions.length === 0) {
          console.log('❌ NO SUBMISSIONS FOUND for this contest after filtering');
          console.log('This could mean:');
          console.log('1. No students have submitted solutions for this contest yet');
          console.log('2. Backend is not returning contest submissions');
          console.log('3. contestId field is not set in submissions');
          setLatestSubmissions([]);
          calculateStatistics([], []);
          setAnalysisLoading(false);
          return;
        }
        
        console.log(`✅ Found ${allSubmissions.length} submissions for this contest`);
        
        // ALWAYS fetch and populate data since backend might not be populating correctly
        console.log('=== FETCHING USER AND PROBLEM DATA ===');
        
        // Get unique user IDs and problem IDs that need to be fetched
        const userIds = [...new Set(allSubmissions
          .map(s => {
            if (typeof s.userId === 'string') return s.userId;
            if (s.userId && s.userId._id) return s.userId._id;
            return null;
          })
          .filter(Boolean))];
        
        const problemIds = [...new Set(allSubmissions
          .map(s => {
            if (typeof s.problemId === 'string') return s.problemId;
            if (s.problemId && s.problemId._id) return s.problemId._id;
            return null;
          })
          .filter(Boolean))];
        
        console.log(`Found ${userIds.length} unique user IDs:`, userIds.slice(0, 3));
        console.log(`Found ${problemIds.length} unique problem IDs:`, problemIds.slice(0, 3));
        
        // Fetch users and problems
        const [usersResponse, problemsResponse] = await Promise.all([
          userAPI.getAllUsers({ limit: 10000 }),
          problemsAPI.getAllProblems({ limit: 10000 })
        ]);
        
        console.log('Users response:', usersResponse.success, 'Count:', usersResponse.data?.length);
        console.log('Problems response:', problemsResponse.success, 'Count:', problemsResponse.data?.length);
        
        // Create Maps for quick lookup by _id
        const usersMap = new Map();
        const problemsMap = new Map();
        
        if (usersResponse.success && usersResponse.data) {
          usersResponse.data.forEach(user => {
            if (user._id) {
              usersMap.set(user._id, user);
              usersMap.set(String(user._id), user); // Also store as string key
            }
          });
          console.log(`Created usersMap with ${usersMap.size} entries`);
          // Log first user to see structure
          if (usersResponse.data.length > 0) {
            const firstUser = usersResponse.data[0];
            console.log('Sample user:', {
              _id: firstUser._id,
              name: firstUser.name,
              student_id: firstUser.student_id,
              studentId: firstUser.studentId
            });
          }
        }
        
        if (problemsResponse.success && problemsResponse.data) {
          problemsResponse.data.forEach(problem => {
            if (problem._id) {
              problemsMap.set(problem._id, problem);
              problemsMap.set(String(problem._id), problem); // Also store as string key
            }
          });
          console.log(`Created problemsMap with ${problemsMap.size} entries`);
        }
        
        // Populate submissions with user and problem data
        console.log('=== POPULATING SUBMISSIONS ===');
        allSubmissions = allSubmissions.map((submission, index) => {
          const populatedSubmission = { ...submission };
          
          // Get the user ID (handle both string and object cases)
          let userIdToLookup = null;
          if (typeof submission.userId === 'string') {
            userIdToLookup = submission.userId;
          } else if (submission.userId && submission.userId._id) {
            userIdToLookup = submission.userId._id;
          }
          
          if (userIdToLookup) {
            const user = usersMap.get(userIdToLookup) || usersMap.get(String(userIdToLookup));
            if (user) {
              populatedSubmission.userId = user;
              if (index < 3) { // Log first 3 for debugging
                console.log(`[${index}] Populated user:`, {
                  id: userIdToLookup,
                  name: user.name,
                  student_id: user.student_id,
                  studentId: user.studentId
                });
              }
            } else {
              console.warn(`[${index}] User NOT found for ID: ${userIdToLookup}`);
            }
          }
          
          // Get the problem ID (handle both string and object cases)
          let problemIdToLookup = null;
          if (typeof submission.problemId === 'string') {
            problemIdToLookup = submission.problemId;
          } else if (submission.problemId && submission.problemId._id) {
            problemIdToLookup = submission.problemId._id;
          }
          
          if (problemIdToLookup) {
            const problem = problemsMap.get(problemIdToLookup) || problemsMap.get(String(problemIdToLookup));
            if (problem) {
              populatedSubmission.problemId = problem;
              if (index < 3) { // Log first 3 for debugging
                console.log(`[${index}] Populated problem:`, problem.title);
              }
            } else {
              console.warn(`[${index}] Problem NOT found for ID: ${problemIdToLookup}`);
            }
          }
          
          return populatedSubmission;
        });
        
        console.log('=== POPULATION COMPLETE ===');
        if (allSubmissions.length > 0) {
          console.log('Sample populated submission:', {
            userId: allSubmissions[0].userId,
            problemId: allSubmissions[0].problemId,
            student_id: allSubmissions[0].userId?.student_id,
            studentId: allSubmissions[0].userId?.studentId,
            name: allSubmissions[0].userId?.name
          });
        }
        
        // Process to get latest submission per student per problem
        const latestMap = new Map();
        
        allSubmissions.forEach(submission => {
          if (!submission || !submission.userId || !submission.problemId) return;
          
          const userIdKey = submission.userId._id || submission.userId;
          const problemIdKey = submission.problemId._id || submission.problemId;
          const key = `${userIdKey}-${problemIdKey}`;
          const existing = latestMap.get(key);
          
          if (!existing || new Date(submission.submittedAt) > new Date(existing.submittedAt)) {
            latestMap.set(key, submission);
          }
        });
        
        const latest = Array.from(latestMap.values())
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        console.log('Latest submissions count:', latest.length);
        if (latest.length > 0) {
          console.log('First latest submission:', latest[0]);
        }
        
        setLatestSubmissions(latest);
        calculateStatistics(allSubmissions, latest);
      } else {
        setError('Failed to fetch submissions');
        setLatestSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching contest submissions:', err);
      setError('Failed to fetch contest submissions');
      setLatestSubmissions([]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const calculateStatistics = (allSubmissions, latest) => {
    if (!selectedContest) return;

    const uniqueParticipants = new Set(
      allSubmissions.map(s => s.userId?._id || s.userId).filter(Boolean)
    ).size;

    const uniqueProblems = new Set(
      latest.map(s => s.problemId?._id || s.problemId).filter(Boolean)
    ).size;

    const acceptedSubmissions = latest.filter(
      s => s.status === 'Accepted' || s.verdict === 'Accepted'
    ).length;

    const successRate = latest.length > 0 
      ? ((acceptedSubmissions / latest.length) * 100).toFixed(2)
      : 0;

    const totalProblems = selectedContest.problems?.length || 0;
    const completionRate = totalProblems > 0
      ? ((uniqueProblems / totalProblems) * 100).toFixed(2)
      : 0;

    setStatistics({
      totalParticipants: uniqueParticipants,
      totalSubmissions: allSubmissions.length,
      uniqueProblems,
      successRate: parseFloat(successRate),
      averageScore: 0, // Can be calculated based on points
      completionRate: parseFloat(completionRate)
    });
  };

  const handleContestSelect = (contest) => {
    setSelectedContest(contest);
    fetchContestSubmissions(contest._id);
    setSearchTerm('');
    setStatusFilter('All');
  };

  const handleViewCode = (submission) => {
    setSelectedSubmission(submission);
    setShowCodeModal(true);
  };

  const normalizeStatus = (status) => {
    if (!status) return '';
    // Convert from snake_case to Title Case (e.g., "runtime_error" -> "Runtime Error")
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'Accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Wrong Answer':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Time Limit Exceeded':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Runtime Error':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Compilation Error':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'Accepted') {
      return <HiCheckCircle className="text-green-400" />;
    }
    return <HiXCircle className="text-red-400" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const exportToCSV = () => {
    if (latestSubmissions.length === 0) return;

    const headers = ['Student ID', 'Student Name', 'Problem', 'Status', 'Language', 'Submitted At'];
    const rows = latestSubmissions.map(sub => {
      const studentId = typeof sub.userId === 'object' 
        ? (sub.userId?.student_id || sub.userId?.studentId || 'N/A')
        : 'N/A';
      const studentName = typeof sub.userId === 'object'
        ? (sub.userId?.name || 'N/A')
        : 'N/A';
      const problemTitle = typeof sub.problemId === 'object'
        ? (sub.problemId?.title || 'N/A')
        : 'N/A';
      
      return [
        studentId,
        studentName,
        problemTitle,
        normalizeStatus(sub.status || sub.verdict || 'N/A'),
        sub.language || 'N/A',
        formatDate(sub.submittedAt)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contest_${selectedContest?.title}_submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubmissions = latestSubmissions.filter(submission => {
    // Case-insensitive search - prioritize student ID, then name, then problem
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Handle both populated and non-populated userId/problemId
    const studentId = typeof submission.userId === 'object' 
      ? (submission.userId?.student_id || submission.userId?.studentId || '')
      : '';
    const studentName = typeof submission.userId === 'object'
      ? (submission.userId?.name || '')
      : '';
    const problemTitle = typeof submission.problemId === 'object'
      ? (submission.problemId?.title || '')
      : '';
    
    const matchesSearch = searchTerm === '' || 
      studentId.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower) ||
      problemTitle.toLowerCase().includes(searchLower);

    // Status filter - normalize both the submission status and filter value for comparison
    const submissionStatus = normalizeStatus(submission.status || submission.verdict || '');
    const matchesStatus = statusFilter === 'All' || submissionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <HiArrowLeft className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </button>
            )}
            
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <HiChartBar className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Contest Submission Analysis</h1>
              <p className="text-gray-400">View latest submissions for each student in contests</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Contest Selection */}
        {!selectedContest ? (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Select a Contest</h2>
            {contests.length === 0 ? (
              <div className="text-center py-12">
                <HiChartBar className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Contests Available</h3>
                <p className="text-gray-400">There are no active or completed contests to analyze.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contests.map(contest => (
                  <div
                    key={contest._id}
                    onClick={() => handleContestSelect(contest)}
                    className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{contest.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        contest.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {contest.status}
                      </span>
                      <span className="text-gray-400">{contest.problems?.length || 0} problems</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Selected Contest Header */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedContest.title}</h2>
                  <p className="text-gray-400">{selectedContest.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedContest(null);
                    setLatestSubmissions([]);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Change Contest
                </button>
              </div>

              {/* Statistics */}
              {!analysisLoading && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{statistics.totalParticipants}</div>
                    <div className="text-xs text-gray-400 mt-1">Participants</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{statistics.totalSubmissions}</div>
                    <div className="text-xs text-gray-400 mt-1">Total Submissions</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{latestSubmissions.length}</div>
                    <div className="text-xs text-gray-400 mt-1">Latest Submissions</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{statistics.uniqueProblems}</div>
                    <div className="text-xs text-gray-400 mt-1">Problems Attempted</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{statistics.successRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">Success Rate</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-400">{statistics.completionRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">Completion Rate</div>
                  </div>
                </div>
              )}
            </div>

            {analysisLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading submissions...</p>
              </div>
            ) : (
              <>
                {/* Filters and Actions */}
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Search (Case-insensitive)</label>
                      <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by student ID, name, or problem..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Wrong Answer">Wrong Answer</option>
                        <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                        <option value="Runtime Error">Runtime Error</option>
                        <option value="Compilation Error">Compilation Error</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-400">
                      Showing {filteredSubmissions.length} of {latestSubmissions.length} latest submissions
                    </div>
                    <button
                      onClick={exportToCSV}
                      disabled={latestSubmissions.length === 0}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <HiDownload />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Latest Submissions per Student</h2>
                    <p className="text-gray-400 text-sm mt-1">Showing the most recent submission for each student-problem combination</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student (ID / Name)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Language</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Submitted</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredSubmissions.map((submission) => {
                          // Handle both populated and non-populated userId/problemId
                          const studentId = typeof submission.userId === 'object' 
                            ? (submission.userId?.student_id || submission.userId?.studentId || 'N/A')
                            : 'N/A';
                          const studentName = typeof submission.userId === 'object'
                            ? (submission.userId?.name || 'N/A')
                            : 'N/A';
                          const problemTitle = typeof submission.problemId === 'object'
                            ? (submission.problemId?.title || 'N/A')
                            : 'N/A';
                          
                          return (
                          <tr key={submission._id} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-white">{studentId}</div>
                                <div className="text-sm text-gray-400">{studentName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{problemTitle}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(submission.status || submission.verdict)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status || submission.verdict)}`}>
                                  {normalizeStatus(submission.status || submission.verdict) || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-300">{submission.language || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-gray-300 text-sm">
                                <HiClock className="mr-2 text-gray-400" />
                                {formatDate(submission.submittedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleViewCode(submission)}
                                className="flex items-center space-x-1 p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                title="View Code"
                              >
                                <HiCode className="text-sm" />
                                <span className="text-xs">View</span>
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredSubmissions.length === 0 && (
                    <div className="text-center py-12">
                      <HiCode className="mx-auto text-4xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Contest Submissions Found</h3>
                      {latestSubmissions.length === 0 ? (
                        <div>
                          <p className="text-gray-400 mb-4">
                            No submissions have been made for this contest yet.
                          </p>
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto text-left">
                            <p className="text-yellow-400 text-sm font-semibold mb-2">💡 Troubleshooting Tips:</p>
                            <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                              <li>Make sure students have submitted code during the contest</li>
                              <li>Check that submissions have the contestId field set</li>
                              <li>Open browser console (F12) to see detailed logs</li>
                              <li>Verify the contest is Active or Completed</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No submissions match your current filters. Try changing the status filter or search term.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Code View Modal */}
        {showCodeModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-white">Submission Code</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {typeof selectedSubmission.userId === 'object' 
                      ? `${selectedSubmission.userId?.student_id || selectedSubmission.userId?.studentId || 'N/A'} (${selectedSubmission.userId?.name || 'N/A'})` 
                      : 'N/A'} - {typeof selectedSubmission.problemId === 'object' 
                      ? (selectedSubmission.problemId?.title || 'N/A')
                      : 'N/A'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowCodeModal(false)} 
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Status</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedSubmission.status || selectedSubmission.verdict)}`}>
                      {normalizeStatus(selectedSubmission.status || selectedSubmission.verdict)}
                    </span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Language</div>
                    <div className="text-white font-medium">{selectedSubmission.language}</div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-2">Code:</div>
                  <pre className="text-sm text-gray-300 overflow-x-auto bg-gray-900 p-4 rounded">
                    <code>{selectedSubmission.code || 'No code available'}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestSubmissionAnalysis;
