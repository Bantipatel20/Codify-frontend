// src/components/client/Contests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiStar, HiCalendar, HiClock, HiUsers, HiPlay, HiEye, HiFilter, HiRefresh } from 'react-icons/hi';
import { contestAPI, authAPI } from '../../services/api';

const Contests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [userProfile, setUserProfile] = useState(null);

  // Memoize fetchUserProfile to prevent unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    try {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        setUserProfile(currentUser);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  // Memoize eligibility check function
  const checkEligibility = useCallback((contest) => {
    // If no user profile, don't show any contests
    if (!userProfile) {
      return false;
    }

    // If manual selection, allow all authenticated users
    if (contest.participantSelection === 'manual') {
      return true;
    }

    // For automatic selection, check filter criteria
    if (contest.participantSelection === 'automatic' && contest.filterCriteria) {
      const criteria = contest.filterCriteria;
      
      // Check each criterion - ALL specified criteria must match for eligibility
      if (criteria.department && criteria.department.length > 0) {
        const userDept = userProfile.department;
        const allowedDepts = Array.isArray(criteria.department) ? criteria.department : [criteria.department];
        if (!allowedDepts.includes(userDept)) {
          return false;
        }
      }
      
      if (criteria.semester && criteria.semester.length > 0) {
        const userSem = userProfile.semester;
        const allowedSems = Array.isArray(criteria.semester) ? criteria.semester : [criteria.semester];
        if (!allowedSems.includes(userSem)) {
          return false;
        }
      }
      
      if (criteria.division && criteria.division.length > 0) {
        const userDiv = userProfile.division;
        const allowedDivs = Array.isArray(criteria.division) ? criteria.division : [criteria.division];
        if (!allowedDivs.includes(userDiv)) {
          return false;
        }
      }
      
      if (criteria.batch && criteria.batch.length > 0) {
        const userBatch = userProfile.batch;
        const allowedBatches = Array.isArray(criteria.batch) ? criteria.batch : [criteria.batch];
        if (!allowedBatches.includes(userBatch)) {
          return false;
        }
      }

      // Additional criteria checks
      if (criteria.year && criteria.year.length > 0) {
        const userYear = userProfile.year;
        const allowedYears = Array.isArray(criteria.year) ? criteria.year : [criteria.year];
        if (!allowedYears.includes(userYear)) {
          return false;
        }
      }

      if (criteria.section && criteria.section.length > 0) {
        const userSection = userProfile.section;
        const allowedSections = Array.isArray(criteria.section) ? criteria.section : [criteria.section];
        if (!allowedSections.includes(userSection)) {
          return false;
        }
      }
    }
    
    return true;
  }, [userProfile]);

  // Memoize registration check function
  const checkRegistration = useCallback((contest) => {
    if (!userProfile) return false;
    return contest.participants?.some(p => 
      (typeof p === 'object' ? p.userId : p) === userProfile._id
    );
  }, [userProfile]);

  // Memoize fetchContests to prevent unnecessary re-renders
  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contestAPI.getAllContests({
        limit: 100,
        page: 1
      });
      
      if (response.success) {
        const contestsData = response.data.map(contest => ({
          ...contest,
          isEligible: checkEligibility(contest),
          isRegistered: checkRegistration(contest)
        }));
        setContests(contestsData);
      } else {
        throw new Error(response.error || 'Failed to fetch contests');
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to load contests. Please make sure your backend server is running and contest routes are configured.');
    } finally {
      setLoading(false);
    }
  }, [userProfile, checkEligibility, checkRegistration]);

  // Memoize filter function to prevent unnecessary re-renders
  const filterContests = useCallback(() => {
    let filtered = contests;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(contest => contest.status === statusFilter);
    }

    // Only show contests user is eligible for
    filtered = filtered.filter(contest => contest.isEligible);

    setFilteredContests(filtered);
  }, [contests, statusFilter]);

  // First useEffect: Fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Second useEffect: Fetch contests when userProfile changes
  useEffect(() => {
    if (userProfile !== null) {
      fetchContests();
    }
  }, [fetchContests, userProfile]);

  // Third useEffect: Filter contests when contests or filter changes
  useEffect(() => {
    filterContests();
  }, [filterContests]);

  const handleRegister = async (contestId) => {
    try {
      if (!userProfile) {
        alert('Please log in to register for contests');
        return;
      }

      const response = await contestAPI.registerParticipant(contestId, userProfile._id);

      if (response.success) {
        alert('Successfully registered for contest!');
        fetchContests(); // Refresh contests to update registration status
      } else {
        throw new Error(response.error || 'Failed to register for contest');
      }
    } catch (err) {
      console.error('Error registering for contest:', err);
      alert(err.message || 'Failed to register for contest');
    }
  };

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilStart = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start - now;
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading contests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <div className="text-gray-400 text-sm mb-6">
            <p>Please check:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Backend server is running on port 5000</li>
              <li>• Contest routes are properly configured</li>
              <li>• Database connection is established</li>
            </ul>
          </div>
          <button 
            onClick={fetchContests}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl mb-4">
            <HiStar className="text-2xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Coding Contests</h1>
          <p className="text-gray-300 text-xl">Compete with fellow coders and showcase your skills</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Available Contests</p>
                <p className="text-2xl font-bold text-white">{contests.length}</p>
              </div>
              <HiStar className="text-yellow-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-blue-400">
                  {contests.filter(c => c.status === 'Upcoming').length}
                </p>
              </div>
              <HiCalendar className="text-blue-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active</p>
                <p className="text-2xl font-bold text-green-400">
                  {contests.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <HiPlay className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Registered</p>
                <p className="text-2xl font-bold text-purple-400">
                  {contests.filter(c => c.isRegistered).length}
                </p>
              </div>
              <HiUsers className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* User Profile Info */}
        {userProfile && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">Your Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Department:</span>
                <span className="text-white ml-2">{userProfile.department || 'Not Set'}</span>
              </div>
              <div>
                <span className="text-gray-400">Semester:</span>
                <span className="text-white ml-2">{userProfile.semester || 'Not Set'}</span>
              </div>
              <div>
                <span className="text-gray-400">Division:</span>
                <span className="text-white ml-2">{userProfile.division || 'Not Set'}</span>
              </div>
              <div>
                <span className="text-gray-400">Batch:</span>
                <span className="text-white ml-2">{userProfile.batch || 'Not Set'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HiFilter className="text-blue-400 text-xl" />
            <h3 className="text-lg font-semibold text-white">Filter Contests</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Contests</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
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
                    {contest.participantSelection === 'automatic' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Auto-Selected
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">{contest.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiCalendar className="text-blue-400" />
                      <span>Start: {formatDate(contest.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiClock className="text-yellow-400" />
                      <span>Duration: {contest.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <HiUsers className="text-purple-400" />
                      <span>{contest.participants?.length || 0}/{contest.maxParticipants} participants</span>
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
                        {contest.filterCriteria.department && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Dept: {Array.isArray(contest.filterCriteria.department) ? contest.filterCriteria.department.join(', ') : contest.filterCriteria.department}
                          </span>
                        )}
                        {contest.filterCriteria.semester && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Sem: {Array.isArray(contest.filterCriteria.semester) ? contest.filterCriteria.semester.join(', ') : contest.filterCriteria.semester}
                          </span>
                        )}
                        {contest.filterCriteria.division && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            Div: {Array.isArray(contest.filterCriteria.division) ? contest.filterCriteria.division.join(', ') : contest.filterCriteria.division}
                          </span>
                        )}
                        {contest.filterCriteria.batch && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                            Batch: {Array.isArray(contest.filterCriteria.batch) ? contest.filterCriteria.batch.join(', ') : contest.filterCriteria.batch}
                          </span>
                        )}
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
                  
                  {contest.status === 'Upcoming' && !contest.isRegistered && (
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

        {filteredContests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiStar className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Eligible Contests Found</h3>
            <p className="text-gray-400">
              {contests.length === 0 
                ? "No contests are available at the moment." 
                : userProfile 
                  ? "No contests match your profile criteria or current filter settings."
                  : "Please log in to view available contests."
              }
            </p>
            {userProfile && contests.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Your profile: {userProfile.department} - {userProfile.semester} - {userProfile.division} - {userProfile.batch}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;
