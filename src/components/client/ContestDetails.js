// src/components/client/ContestDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiStar, HiCalendar, HiClock, HiUsers, HiPlay, HiEye } from 'react-icons/hi';
import { contestAPI } from '../../services/api';

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchContestDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contestAPI.getContestById(id);
      if (response.success) {
        setContest(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch contest details');
      }
    } catch (err) {
      console.error('Error fetching contest details:', err);
      setError('Failed to load contest details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await contestAPI.getContestLeaderboard(id);
      if (response.success) {
        setLeaderboard(response.data.leaderboard || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      // Don't set error for leaderboard, just keep empty array
    }
  }, [id]);

  useEffect(() => {
    fetchContestDetails();
    fetchLeaderboard();
  }, [fetchContestDetails, fetchLeaderboard]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading contest details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button 
            onClick={() => navigate('/client/contests')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-white text-lg">Contest not found</p>
          <button 
            onClick={() => navigate('/client/contests')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/client/contests')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-lg"
          >
            <HiArrowLeft className="text-xl" />
            <span className="font-medium">Back to Contests</span>
          </button>
        </div>

        {/* Contest Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <HiStar className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{contest.title}</h1>
                  <p className="text-gray-300">{contest.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-2">
                  <HiCalendar className="text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Start Time</p>
                    <p className="text-white font-medium">{formatDate(contest.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <HiClock className="text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-white font-medium">{contest.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <HiUsers className="text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Participants</p>
                    <p className="text-white font-medium">{contest.participants?.length || 0}/{contest.maxParticipants}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <HiStar className="text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">Problems</p>
                    <p className="text-white font-medium">{contest.problems?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {contest.status === 'Active' && (
              <button 
                onClick={() => navigate(`/client/contests/${contest._id}/participate`)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
              >
                <HiPlay className="text-xl" />
                <span>Participate Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/20">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === 'overview' 
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📋 Overview
            </button>
            <button 
              onClick={() => setActiveTab('problems')}
              className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === 'problems' 
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🧩 Problems ({contest.problems?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === 'leaderboard' 
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🏆 Leaderboard ({contest.participants?.length || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Contest Rules</h3>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-300 whitespace-pre-line">{contest.rules || 'No specific rules provided for this contest.'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Contest Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-medium text-white mb-2">Registration</h4>
                      <p className="text-gray-300 text-sm">
                        {contest.participantSelection === 'manual' ? 'Open to all students' : 'Filtered by criteria'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-medium text-white mb-2">Total Points</h4>
                      <p className="text-gray-300 text-sm">{contest.totalPoints || 'TBD'} points available</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-medium text-white mb-2">Status</h4>
                      <p className="text-gray-300 text-sm">{contest.status}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-medium text-white mb-2">End Date</h4>
                      <p className="text-gray-300 text-sm">{formatDate(contest.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                {contest.filterCriteria && contest.participantSelection === 'automatic' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Eligibility Criteria</h3>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex flex-wrap gap-2">
                        {contest.filterCriteria.department && (
                          <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                            Department: {Array.isArray(contest.filterCriteria.department) ? contest.filterCriteria.department.join(', ') : contest.filterCriteria.department}
                          </span>
                        )}
                        {contest.filterCriteria.semester && (
                          <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                            Semester: {Array.isArray(contest.filterCriteria.semester) ? contest.filterCriteria.semester.join(', ') : contest.filterCriteria.semester}
                          </span>
                        )}
                        {contest.filterCriteria.division && (
                          <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                            Division: {Array.isArray(contest.filterCriteria.division) ? contest.filterCriteria.division.join(', ') : contest.filterCriteria.division}
                          </span>
                        )}
                        {contest.filterCriteria.batch && (
                          <span className="text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                            Batch: {Array.isArray(contest.filterCriteria.batch) ? contest.filterCriteria.batch.join(', ') : contest.filterCriteria.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'problems' && (
              <div className="space-y-4">
                {contest.problems && contest.problems.length > 0 ? (
                  contest.problems.map((problem, index) => (
                    <div key={problem.problemId || problem._id || index} className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-gray-400 font-mono">#{index + 1}</span>
                            <h4 className="font-semibold text-white">{problem.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>💰 {problem.points || 100} points</span>
                            <span>📊 {problem.category || 'General'}</span>
                            {problem.solvedCount > 0 && (
                              <span>✅ {problem.solvedCount} solved</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate('/client/practice/compiler', { 
                            state: { problem: { ...problem, contestId: contest._id } } 
                          })}
                          className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                        >
                          <HiEye className="text-sm" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiStar className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Problems Available</h3>
                    <p className="text-gray-400">This contest doesn't have any problems yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Participant</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Score</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Submissions</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {leaderboard.map((participant, index) => (
                          <tr key={participant.userId || index} className="hover:bg-gray-800/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <span className={`font-bold ${
                                  index === 0 ? 'text-yellow-400' : 
                                  index === 1 ? 'text-gray-300' : 
                                  index === 2 ? 'text-orange-400' : 'text-white'
                                }`}>
                                  #{participant.rank || (index + 1)}
                                </span>
                                {index < 3 && <span className="ml-2">🏆</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-white">{participant.name || 'Anonymous'}</div>
                                <div className="text-sm text-gray-400">{participant.email || 'N/A'}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-lg font-bold text-blue-400">{participant.score || 0}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-300">{participant.submissions || 0}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-300">{participant.department || 'N/A'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No participants yet</h3>
                    <p className="text-gray-400">Be the first to register for this contest!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetails;
