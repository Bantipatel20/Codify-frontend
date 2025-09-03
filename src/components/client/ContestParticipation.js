// src/components/client/ContestParticipation.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiClock, HiPlay, HiCheck } from 'react-icons/hi';
import { contestAPI } from '../../services/api';

const ContestParticipation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const updateTimer = useCallback(() => {
    if (!contest) return;
    
    const now = new Date();
    const end = new Date(contest.endDate);
    const diff = end - now;
    
    if (diff <= 0) {
      setTimeRemaining('Contest Ended');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [contest]);

  useEffect(() => {
    fetchContestDetails();
  }, [fetchContestDetails]);

  useEffect(() => {
    if (contest) {
      updateTimer(); // Update immediately
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [contest, updateTimer]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleSolveProblem = (problem) => {
    navigate('/client/practice/compiler', { 
      state: { 
        problem: { ...problem, contestId: contest._id },
        isContestMode: true 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading contest...</p>
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
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(`/client/contests/${id}`)}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-lg"
          >
            <HiArrowLeft className="text-xl" />
            <span className="font-medium">Back to Contest</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/30">
              <HiClock className="text-xl" />
              <span className="font-mono text-xl font-bold">{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Contest Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{contest?.title}</h1>
          <p className="text-gray-300">Solve all problems to maximize your score!</p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contest?.problems?.map((problem, index) => (
            <div key={problem.problemId || problem._id || index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-400">{problem.points || 100}</div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                  Category: {problem.category || 'General'}
                </div>
                {problem.solved && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <HiCheck className="text-sm" />
                    <span className="text-xs">Solved</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleSolveProblem(problem)}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  problem.solved 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                <HiPlay className="text-lg" />
                <span>{problem.solved ? 'Review Solution' : 'Solve Problem'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Contest Stats */}
        <div className="mt-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {contest?.problems?.filter(p => p.solved).length || 0}
              </div>
              <div className="text-sm text-gray-400">Problems Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {contest?.problems?.reduce((sum, p) => sum + (p.solved ? (p.points || 100) : 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-400">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {contest?.problems?.length ? Math.round((contest.problems.filter(p => p.solved).length / contest.problems.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-400">Completion</div>
            </div>
          </div>
        </div>

        {/* No Problems Message */}
        {(!contest?.problems || contest.problems.length === 0) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiPlay className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Problems Available</h3>
            <p className="text-gray-400">This contest doesn't have any problems yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestParticipation;
