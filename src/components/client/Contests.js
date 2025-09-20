// src/components/client/Contests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiStar, HiCalendar, HiClock, HiUsers, HiPlay, HiEye, HiRefresh, HiExclamationCircle } from 'react-icons/hi';
import { contestAPI, authAPI } from '../../services/api';

const Contests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);


  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        console.log('✅ User profile loaded:', currentUser);
        setUserProfile(currentUser);
        return currentUser;
      } else {
        console.log('❌ No user profile found in localStorage');
        setError('Please log in to view contests');
        return null;
      }
    } catch (err) {
      console.error('❌ Error fetching user profile:', err);
      setError('Error loading user profile');
      return null;
    }
  }, []);

  // Check if user is eligible for contest
  const checkEligibility = useCallback((contest, user) => {
    if (!user) {
      console.log('❌ No user profile, hiding contest:', contest.title);
      return false;
    }

    // Manual selection contests are open to all authenticated users
    if (contest.participantSelection === 'manual') {
      console.log('✅ Manual selection contest, showing:', contest.title);
      return true;
    }

    // Automatic selection contests need criteria checking
    if (contest.participantSelection === 'automatic' && contest.filterCriteria) {
      const criteria = contest.filterCriteria;
      
      console.log('🔍 Checking eligibility for:', contest.title);
      console.log('User:', { 
        dept: user.department, 
        sem: user.semester, 
        div: user.div, 
        batch: user.batch 
      });
      console.log('Criteria:', criteria);
      
      // Check department - handle both array and string formats
      if (criteria.department && criteria.department.length > 0) {
        const allowedDepts = Array.isArray(criteria.department) 
          ? criteria.department 
          : [criteria.department];
        
        if (!allowedDepts.includes(user.department)) {
          console.log('❌ Department mismatch:', user.department, 'not in', allowedDepts);
          return false;
        }
      }
      
      // Check semester - handle both array and string formats
      if (criteria.semester && criteria.semester.length > 0) {
        const userSem = parseInt(user.semester);
        const allowedSems = Array.isArray(criteria.semester) 
          ? criteria.semester.map(s => parseInt(s))
          : [parseInt(criteria.semester)];
        
        if (!allowedSems.includes(userSem)) {
          console.log('❌ Semester mismatch:', userSem, 'not in', allowedSems);
          return false;
        }
      }
      
      // Check division - handle both array and string formats
      if (criteria.division && criteria.division.length > 0) {
        const userDiv = parseInt(user.div);
        const allowedDivs = Array.isArray(criteria.division) 
          ? criteria.division.map(d => parseInt(d))
          : [parseInt(criteria.division)];
        
        if (!allowedDivs.includes(userDiv)) {
          console.log('❌ Division mismatch:', userDiv, 'not in', allowedDivs);
          return false;
        }
      }
      
      // Check batch - handle both array and string formats
      if (criteria.batch && criteria.batch.length > 0) {
        const allowedBatches = Array.isArray(criteria.batch) 
          ? criteria.batch 
          : [criteria.batch];
        
        if (!allowedBatches.includes(user.batch)) {
          console.log('❌ Batch mismatch:', user.batch, 'not in', allowedBatches);
          return false;
        }
      }
      
      // If all criteria arrays are empty, show the contest to everyone (no filtering)
      const hasAnyCriteria = (
        (criteria.department && criteria.department.length > 0) ||
        (criteria.semester && criteria.semester.length > 0) ||
        (criteria.division && criteria.division.length > 0) ||
        (criteria.batch && criteria.batch.length > 0)
      );
      
      if (!hasAnyCriteria) {
        console.log('✅ No criteria specified, showing contest to all users:', contest.title);
        return true;
      }
    }
    
    console.log('✅ Contest eligible:', contest.title);
    return true;
  }, []);

  // Check if user is registered for contest
  const checkRegistration = useCallback((contest, user) => {
    if (!user || !contest.participants) return false;
    return contest.participants.some(p => 
      (typeof p === 'object' ? p.userId : p) === user._id
    );
  }, []);

  // Fetch contests
  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching contests...');
      
      // Get user profile first
      const user = await fetchUserProfile();
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Fetch contests using direct API call
      const response = await fetch('http://localhost:5000/api/contests?limit=100&page=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });
      
      console.log('📡 API Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 API Response Data:', data);
      
      if (data.success && data.data) {
        console.log(`📊 Found ${data.data.length} contests`);
        
        if (data.data.length === 0) {
          console.log('📭 No contests found in database');
          setContests([]);
          setFilteredContests([]);
          setLoading(false);
          return;
        }
        
        // Process contests with eligibility and registration checks
        const processedContests = data.data.map(contest => {
          const isEligible = checkEligibility(contest, user);
          const isRegistered = checkRegistration(contest, user);
          
          console.log(`🏆 Contest "${contest.title}":`, {
            eligible: isEligible,
            registered: isRegistered,
            selection: contest.participantSelection,
            status: contest.status,
            criteriaEmpty: !contest.filterCriteria || Object.values(contest.filterCriteria).every(v => 
              Array.isArray(v) ? v.length === 0 : !v
            )
          });
          
          return {
            ...contest,
            isEligible,
            isRegistered
          };
        });
        
        setContests(processedContests);
        
        // Filter eligible contests
        const eligibleContests = processedContests.filter(contest => contest.isEligible);
        console.log(`✨ Showing ${eligibleContests.length} eligible contests out of ${processedContests.length} total`);
        setFilteredContests(eligibleContests);
        
      } else {
        console.error('❌ API response not successful:', data);
        throw new Error(data?.error || data?.message || 'Invalid response from server');
      }
      
    } catch (err) {
      console.error('❌ Fetch contests error:', err);
      
      let errorMessage = 'Failed to load contests';
      
      if (err.message.includes('HTTP 404')) {
        errorMessage = 'Contest service not found. Please check if the backend contest routes are configured.';
      } else if (err.message.includes('HTTP 500')) {
        errorMessage = 'Server error. Please check the backend logs.';
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile, checkEligibility, checkRegistration]);

  // Initial load
  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  // Handle contest registration
  const handleRegister = async (contestId) => {
    try {
      if (!userProfile) {
        alert('Please log in to register for contests');
        return;
      }

      console.log('🔄 Registering for contest:', contestId);
      
      const response = await contestAPI.registerParticipant(contestId, userProfile._id);

      if (response.success) {
        alert('Successfully registered for contest!');
        await fetchContests();
      } else {
        throw new Error(response.error || 'Failed to register for contest');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      alert(err.message || 'Failed to register for contest');
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getTimeUntilStart = (startDate) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const diff = start - now;
      
      if (diff <= 0) return 'Started';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      return `${hours}h`;
    } catch (err) {
      return 'Unknown';
    }
  };

  // Display criteria helper
  const formatCriteria = (criteria) => {
    const parts = [];
    
    if (criteria.department && criteria.department.length > 0) {
      parts.push(`Dept: ${criteria.department.join(', ')}`);
    }
    if (criteria.semester && criteria.semester.length > 0) {
      parts.push(`Sem: ${criteria.semester.join(', ')}`);
    }
    if (criteria.division && criteria.division.length > 0) {
      parts.push(`Div: ${criteria.division.join(', ')}`);
    }
    if (criteria.batch && criteria.batch.length > 0) {
      parts.push(`Batch: ${criteria.batch.join(', ')}`);
    }
    
    return parts.length > 0 ? parts : ['Open to all users'];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading contests...</p>
          <p className="text-gray-400 text-sm mt-2">
            Checking server connection and user eligibility...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-red-400 text-6xl mb-6">
            <HiExclamationCircle className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Contests</h2>
          <p className="text-white text-lg mb-6">{error}</p>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={fetchContests}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              <HiRefresh className="text-lg" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl mb-4">
            <HiStar className="text-2xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Programming Contests</h1>
    
            
        </div>

        {/* Contests List */}
        <div className="space-y-6">
          {filteredContests.map((contest) => (
            <div key={contest._id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-xl font-bold text-white">{contest.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                      {contest.status}
                    </span>
                    {contest.isRegistered && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        Registered ✓
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      contest.participantSelection === 'automatic' 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                        : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {contest.participantSelection === 'automatic' ? 'Auto-Selected' : 'Manual Registration'}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{contest.description || 'No description available'}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiCalendar className="text-blue-400" />
                      <span>Start: {formatDate(contest.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiClock className="text-yellow-400" />
                      <span>Duration: {contest.duration || 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiUsers className="text-purple-400" />
                      <span>{contest.participants?.length || 0}/{contest.maxParticipants || '∞'} participants</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiStar className="text-orange-400" />
                      <span>{contest.problems?.length || 0} problems</span>
                    </div>
                  </div>

                  {contest.status === 'Upcoming' && (
                    <div className="text-sm text-blue-400 mb-4">
                      Starts in: {getTimeUntilStart(contest.startDate)}
                    </div>
                  )}

                  {/* Contest Criteria Display */}
                  {contest.filterCriteria && contest.participantSelection === 'automatic' && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Eligibility Criteria:</p>
                      <div className="flex flex-wrap gap-2">
                        {formatCriteria(contest.filterCriteria).map((criterion, index) => (
                          <span key={index} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {criterion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problems Preview */}
                  {contest.problems && contest.problems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {contest.problems.slice(0, 3).map((problem, index) => (
                        <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {problem.title} ({problem.difficulty})
                        </span>
                      ))}
                      {contest.problems.length > 3 && (
                        <span className="text-xs text-gray-500">+{contest.problems.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  {contest.status === 'Active' && contest.isRegistered && (
                    <button 
                      onClick={() => navigate(`/client/contests/${contest._id}/participate`)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <HiPlay className="text-lg" />
                      <span>Participate</span>
                    </button>
                  )}
                  
                  {contest.status === 'Upcoming' && !contest.isRegistered && contest.participantSelection === 'manual' && (
                    <button 
                      onClick={() => handleRegister(contest._id)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <HiUsers className="text-lg" />
                      <span>Register</span>
                    </button>
                  )}

                  <button 
                    onClick={() => navigate(`/client/contests/${contest._id}`)}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    <HiEye className="text-lg" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredContests.length === 0 && contests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiStar className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Contests Available</h3>
            <p className="text-gray-400 mb-6">
              There are currently no active contests in the system.
            </p>
            <button 
              onClick={fetchContests}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 mx-auto"
            >
              <HiRefresh className="text-lg" />
              <span>Refresh</span>
            </button>
          </div>
        )}

        {/* No Eligible Contests */}
        {filteredContests.length === 0 && contests.length > 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiUsers className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Eligible Contests</h3>
            <p className="text-gray-400 mb-4">
              Found {contests.length} contest{contests.length !== 1 ? 's' : ''}, but none match your profile.
            </p>
            {userProfile && (
              <div className="bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto mb-6">
                <p className="text-sm text-gray-300">
                  <strong>Your Profile:</strong><br />
                  Department: {userProfile.department}<br />
                  Semester: {userProfile.semester}<br />
                  Division: {userProfile.div}<br />
                  Batch: {userProfile.batch}
                </p>
              </div>
            )}
            <button 
              onClick={fetchContests}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 mx-auto"
            >
              <HiRefresh className="text-lg" />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;
