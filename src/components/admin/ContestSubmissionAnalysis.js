// src/components/admin/ContestSubmissionAnalysis.js
import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiSearch, HiCode, HiCheckCircle, HiClock, HiChartBar } from 'react-icons/hi';
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

  // Monitor statistics state changes
  useEffect(() => {
    console.log('🔄 Statistics state CHANGED:', statistics);
  }, [statistics]);

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

  const fetchContestSubmissions = async (contestId, contestObj = null) => {
    try {
      setAnalysisLoading(true);
      setError('');
      
      console.log('=== FETCHING CONTEST SUBMISSIONS ===');
      console.log('Contest ID:', contestId);
      console.log('Contest ID type:', typeof contestId);
      
      // Fetch ALL submissions with code included
      const response = await submissionsAPI.getAllSubmissions({ 
        limit: 10000,
        includeCode: true // Request code field from backend
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
          console.log('HAS CODE?:', !!allSubmissions[0].code);
          console.log('CODE LENGTH:', allSubmissions[0].code?.length || 0);
          
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
          calculateStatistics([], [], contestObj);
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
        
        const latest = Array.from(latestMap.values());
        
        // Group by student and calculate total scores for leaderboard
        const studentScores = new Map();
        
        latest.forEach(submission => {
          const userIdKey = submission.userId._id || submission.userId;
          const userId = String(userIdKey);
          
          if (!studentScores.has(userId)) {
            studentScores.set(userId, {
              userId: submission.userId,
              totalScore: 0,
              problemsSolved: 0,
              submissions: [],
              lastSubmission: submission.submittedAt
            });
          }
          
          const studentData = studentScores.get(userId);
          studentData.submissions.push(submission);
          
          // Add score (0-100 per problem, accepted = 100)
          const score = submission.score || 0;
          studentData.totalScore += score;
          
          if (submission.status === 'accepted' || submission.status === 'Accepted') {
            studentData.problemsSolved++;
          }
          
          // Update last submission time
          if (new Date(submission.submittedAt) > new Date(studentData.lastSubmission)) {
            studentData.lastSubmission = submission.submittedAt;
          }
        });
        
        // Convert to array and sort by total score (descending), then by problems solved
        const leaderboard = Array.from(studentScores.values())
          .sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
              return b.totalScore - a.totalScore; // Higher score first
            }
            if (b.problemsSolved !== a.problemsSolved) {
              return b.problemsSolved - a.problemsSolved; // More problems solved first
            }
            return new Date(a.lastSubmission) - new Date(b.lastSubmission); // Earlier submission first (tiebreaker)
          });
        
        console.log('Leaderboard count:', leaderboard.length);
        if (leaderboard.length > 0) {
          console.log('Top student:', leaderboard[0]);
        }
        
  setLatestSubmissions(leaderboard);
  // Pass contestObj (if provided) to ensure statistics calculation does not
  // depend on React state update timing for `selectedContest`.
  calculateStatistics(allSubmissions, leaderboard, contestObj);
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

  const calculateStatistics = (allSubmissions, leaderboard, contest = null) => {
    console.log('📊 ===== CALCULATING STATISTICS =====');
    console.log('Input - allSubmissions:', allSubmissions?.length || 0);
    console.log('Input - leaderboard:', leaderboard?.length || 0);
    console.log('Input - contest param:', contest?.title || 'null');
    console.log('State - selectedContest:', selectedContest?.title || 'null');

    // Use provided contest object (preferred) or fall back to selectedContest state
    const contestContext = contest || selectedContest;
    console.log('Using contestContext:', contestContext?.title || 'NONE');
    
    if (!contestContext) {
      console.warn('⚠️ No contest context provided for statistics. Proceeding with best-effort calculation.');
    }

    // leaderboard is an array of student data with {userId, totalScore, problemsSolved, submissions[]}
    const totalParticipants = Array.isArray(leaderboard) ? leaderboard.length : 0;
    const totalSubmissions = Array.isArray(allSubmissions) ? allSubmissions.length : 0;

    // Calculate total problems solved across all students
    const totalProblemsSolved = Array.isArray(leaderboard)
      ? leaderboard.reduce((sum, student) => sum + (student.problemsSolved || 0), 0)
      : 0;

    const totalProblemsAttempted = Array.isArray(leaderboard)
      ? leaderboard.reduce((sum, student) => sum + (student.submissions?.length || 0), 0)
      : 0;

    console.log('Total problems solved:', totalProblemsSolved);
    console.log('Total problems attempted:', totalProblemsAttempted);

    // Success rate = (total problems solved / total problems attempted) * 100
    const successRate = totalProblemsAttempted > 0
      ? parseFloat(((totalProblemsSolved / totalProblemsAttempted) * 100).toFixed(2))
      : 0;

    // Average score across all students
    const totalScore = Array.isArray(leaderboard)
      ? leaderboard.reduce((sum, student) => sum + (student.totalScore || 0), 0)
      : 0;
    const averageScore = totalParticipants > 0
      ? parseFloat((totalScore / totalParticipants).toFixed(2))
      : 0;

    console.log('Total score:', totalScore);
    console.log('Average score:', averageScore);

    // Unique problems attempted
    const uniqueProblems = new Set(
      (Array.isArray(allSubmissions) ? allSubmissions : []).map(s => s.problemId?._id || s.problemId).filter(Boolean)
    ).size;

    // Completion rate = (unique problems attempted / total contest problems) * 100
    const totalProblems = contestContext?.problems?.length || 0;
    const completionRate = totalProblems > 0
      ? parseFloat(((uniqueProblems / totalProblems) * 100).toFixed(2))
      : 0;

    const newStats = {
      totalParticipants,
      totalSubmissions,
      uniqueProblems,
      successRate,
      averageScore,
      completionRate
    };

    console.log('✅ ===== COMPUTED STATISTICS =====');
    console.log('Total Participants:', totalParticipants);
    console.log('Total Submissions:', totalSubmissions);
    console.log('Problems Attempted:', uniqueProblems);
    console.log('Average Score:', averageScore);
    console.log('Success Rate:', successRate + '%');
    console.log('Completion Rate:', completionRate + '%');
    console.log('Full stats object:', JSON.stringify(newStats, null, 2));
    console.log('Setting statistics state now...');
    
    setStatistics(newStats);
    
    console.log('✅ Statistics state updated!');
  };

  const handleContestSelect = (contest) => {
    setSelectedContest(contest);
    // Pass the contest object as well so statistics can be calculated immediately
    // without waiting for selectedContest state to update.
    fetchContestSubmissions(contest._id, contest);
    setSearchTerm('');
    setStatusFilter('All');
  };

  const handleViewCode = (studentData) => {
    // studentData already contains all submissions for this student
    setSelectedSubmission(studentData);
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

  // CSV export removed — leaderboard CSV option intentionally disabled.

  const filteredSubmissions = latestSubmissions.filter(studentData => {
    // Case-insensitive search - search by student ID or name
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Get student information
    const studentId = typeof studentData.userId === 'object' 
      ? (studentData.userId?.student_id || studentData.userId?.studentId || '')
      : '';
    const studentName = typeof studentData.userId === 'object'
      ? (studentData.userId?.name || '')
      : '';
    
    const matchesSearch = searchTerm === '' || 
      studentId.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower);

    // Status filter - check if ANY submission matches the status
    let matchesStatus = statusFilter === 'All';
    if (!matchesStatus && studentData.submissions) {
      matchesStatus = studentData.submissions.some(sub => {
        const submissionStatus = normalizeStatus(sub.status || sub.verdict || '');
        return submissionStatus === statusFilter;
      });
    }

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

              {/* Leaderboard Statistics */}
              {!analysisLoading && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{statistics.totalParticipants || 0}</div>
                    <div className="text-xs text-gray-300 mt-1">Total Participants</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{statistics.totalSubmissions || 0}</div>
                    <div className="text-xs text-gray-300 mt-1">Total Submissions</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{statistics.uniqueProblems || 0}</div>
                    <div className="text-xs text-gray-300 mt-1">Problems Attempted</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{(statistics.averageScore || 0).toFixed(0)}</div>
                    <div className="text-xs text-gray-300 mt-1">Avg Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-400">{(statistics.successRate || 0).toFixed(1)}%</div>
                    <div className="text-xs text-gray-300 mt-1">Success Rate</div>
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
                      Showing {filteredSubmissions.length} of {latestSubmissions.length} students
                    </div>
                    {/* CSV export button removed as per request */}
                    <div />
                  </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Contest Leaderboard</h2>
                    <p className="text-gray-400 text-sm mt-1">Students ranked by total score and problems solved</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student (ID / Name)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Total Score</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problems Solved</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Submission</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredSubmissions.map((studentData, index) => {
                          // Extract student information
                          const studentId = typeof studentData.userId === 'object' 
                            ? (studentData.userId?.student_id || studentData.userId?.studentId || 'N/A')
                            : 'N/A';
                          const studentName = typeof studentData.userId === 'object'
                            ? (studentData.userId?.name || 'N/A')
                            : 'N/A';
                          
                          // Rank styling
                          const rankClass = index === 0 
                            ? 'text-yellow-400 font-bold text-lg' 
                            : index === 1 
                            ? 'text-gray-300 font-bold text-lg' 
                            : index === 2 
                            ? 'text-orange-400 font-bold text-lg' 
                            : 'text-gray-400';
                          
                          const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                          
                          return (
                          <tr key={studentData.userId._id || index} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className={`flex items-center space-x-2 ${rankClass}`}>
                                {rankIcon && <span>{rankIcon}</span>}
                                <span className="font-bold">{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {studentId.slice(-2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-white">{studentId}</div>
                                  <div className="text-sm text-gray-400">{studentName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-white">{studentData.totalScore}</span>
                                <span className="text-gray-400 text-sm">pts</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <HiCheckCircle className="text-green-400" />
                                <span className="text-white font-medium">{studentData.problemsSolved}</span>
                                <span className="text-gray-400 text-sm">/ {studentData.submissions.length}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-gray-300 text-sm">
                                <HiClock className="mr-2 text-gray-400" />
                                {formatDate(studentData.lastSubmission)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleViewCode(studentData)}
                                className="flex items-center space-x-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                                title="View all problem submissions for this student"
                              >
                                <HiCode className="text-sm" />
                                <span className="text-xs font-medium">View All Code</span>
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

        {/* Code View Modal - Shows All Problem Submissions for Student */}
        {showCodeModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                <div>
                  <h3 className="text-xl font-bold text-white">All Problem Submissions</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {typeof selectedSubmission.userId === 'object' 
                      ? `${selectedSubmission.userId?.student_id || selectedSubmission.userId?.studentId || 'N/A'} - ${selectedSubmission.userId?.name || 'N/A'}`
                      : 'N/A'} - {selectedSubmission.submissions?.filter(s => s.code && s.code.trim() !== '').length || 0} code submission(s)
                  </p>
                  <p className="text-blue-400 text-sm mt-1">
                    Total Score: <span className="font-bold">{selectedSubmission.totalScore}</span> | Solved: <span className="font-bold">{selectedSubmission.problemsSolved}</span>/{selectedSubmission.submissions?.length || 0}
                  </p>
                </div>
                <button 
                  onClick={() => setShowCodeModal(false)} 
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                {(() => {
                  // Filter out submissions without code
                  const submissionsWithCode = selectedSubmission.submissions?.filter(sub => sub.code && sub.code.trim() !== '') || [];
                  
                  if (submissionsWithCode.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-400">
                        <HiCode className="mx-auto text-4xl text-gray-500 mb-4" />
                        <p>No code submissions available for this student</p>
                      </div>
                    );
                  }
                  
                  return submissionsWithCode
                    .sort((a, b) => {
                      // Sort by problem title
                      const titleA = typeof a.problemId === 'object' ? (a.problemId?.title || '') : '';
                      const titleB = typeof b.problemId === 'object' ? (b.problemId?.title || '') : '';
                      return titleA.localeCompare(titleB);
                    })
                    .map((sub, index) => {
                      const problemTitle = typeof sub.problemId === 'object'
                        ? (sub.problemId?.title || 'N/A')
                        : 'N/A';
                      const score = sub.score || 0;
                      
                      return (
                        <div key={sub._id || index} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                          {/* Problem Header */}
                          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-semibold">{problemTitle}</div>
                                  <div className="text-gray-400 text-sm">{sub.language || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-xs text-gray-400">Score</div>
                                  <div className={`text-lg font-bold ${score >= 90 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : score >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                    {score}%
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(sub.status || sub.verdict)}`}>
                                  {normalizeStatus(sub.status || sub.verdict)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Code Display */}
                          <div className="p-4">
                            <div className="text-xs text-gray-400 mb-2 flex items-center justify-between">
                              <span>Code:</span>
                              <span className="text-gray-500">
                                Submitted: {new Date(sub.submittedAt).toLocaleString()}
                              </span>
                            </div>
                            <pre className="text-sm text-gray-300 overflow-x-auto bg-gray-900 p-4 rounded border border-gray-700">
                              <code>{sub.code}</code>
                            </pre>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestSubmissionAnalysis;
