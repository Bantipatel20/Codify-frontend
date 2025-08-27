// src/components/client/Contests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiStar, HiCalendar, HiClock, HiUsers, HiPlay, HiEye, HiFilter, HiRefresh } from 'react-icons/hi';
import { contestAPI, authAPI } from '../../services/api'; // Import your API services

const Contests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [userProfile, setUserProfile] = useState(null);

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

  useEffect(() => {
    fetchUserProfile();
    fetchContests();
  }, []);

  useEffect(() => {
    filterContests();
  }, [filterContests]);

  const fetchUserProfile = async () => {
    try {
      // Get user from localStorage first
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        setUserProfile(currentUser);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use your API service instead of direct axios
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
  };

  const checkEligibility = (contest) => {
    if (!userProfile || contest.participantSelection === 'manual') {
      return true; // Manual selection allows all users
    }

    const criteria = contest.filterCriteria;
    
    // Check department filter
    if (criteria?.department && criteria.department !== userProfile.department) {
      return false;
    }
    
    // Check semester filter
    if (criteria?.semester && criteria.semester !== userProfile.semester) {
      return false;
    }
    
    // Check division filter
    if (criteria?.division && criteria.division !== userProfile.division) {
      return false;
    }
    
    // Check batch filter
    if (criteria?.batch && criteria.batch !== userProfile.batch) {
      return false;
    }
    
    return true;
  };

  const checkRegistration = (contest) => {
    if (!userProfile) return false;
    return contest.participants?.some(p => p.userId === userProfile._id || p === userProfile._id);
  };

  const handleRegister = async (contestId) => {
    try {
      if (!userProfile) {
        alert('Please log in to register for contests');
        return;
      }

      // Use your API service instead of direct axios
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

  // Rest of your JSX remains the same...
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
                <p className="text-gray-400 text-sm mb-1">Total Contests</p>
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
            <h3 className="text-xl font-semibold text-white mb-2">No Contests Found</h3>
            <p className="text-gray-400">
              {contests.length === 0 
                ? "No contests are available at the moment." 
                : "No contests match your current filter criteria."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;
