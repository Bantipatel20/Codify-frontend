// src/components/client/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { HiCode, HiDocumentText, HiChartBar, HiStar, HiFire, HiTrendingUp, HiCalendar, HiClock } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    totalSubmissions: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [availableContests, setAvailableContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [problemsRes, contestsRes, submissionsRes] = await Promise.all([
        axios.get('/api/problems?limit=3'),
        axios.get('/api/contests/filter/upcoming'),
        // axios.get('/api/submissions/recent?limit=4') // Uncomment when submissions API is ready
      ]);

      // Set recommended problems
      if (problemsRes.data.success) {
        setRecommendedProblems(problemsRes.data.data.slice(0, 3));
      }

      // Set available contests
      if (contestsRes.data.success) {
        setAvailableContests(contestsRes.data.data);
      }

      // Mock recent activity for now
      setRecentActivity([
        { problem: 'Two Sum', status: 'Solved', time: '2 hours ago', difficulty: 'Easy', score: 100 },
        { problem: 'Valid Parentheses', status: 'Attempted', time: '1 day ago', difficulty: 'Easy', score: 75 },
        { problem: 'Binary Search', status: 'Solved', time: '2 days ago', difficulty: 'Medium', score: 95 },
        { problem: 'Merge Sort', status: 'In Progress', time: '3 days ago', difficulty: 'Medium', score: 0 }
      ]);

      // Mock stats for now
      setStats({
        problemsSolved: 24,
        currentStreak: 7,
        totalSubmissions: 45,
        successRate: 78
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solved': return 'text-green-400 bg-green-500/20';
      case 'Attempted': return 'text-orange-400 bg-orange-500/20';
      case 'In Progress': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Welcome Back, Coder! 🚀
            </h1>
            <p className="text-xl text-gray-300">
              Ready to tackle some challenges today? Let's see your progress!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 transform group-hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <HiCode className="text-2xl text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.problemsSolved}</p>
                </div>
              </div>
              <p className="text-gray-300 font-medium">Problems Solved</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 transform group-hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <HiFire className="text-2xl text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.currentStreak} days</p>
                </div>
              </div>
              <p className="text-gray-300 font-medium">Current Streak</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 transform group-hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <HiDocumentText className="text-2xl text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.totalSubmissions}</p>
                </div>
              </div>
              <p className="text-gray-300 font-medium">Total Submissions</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 transform group-hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <HiTrendingUp className="text-2xl text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
                </div>
              </div>
              <p className="text-gray-300 font-medium">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <HiClock className="mr-3 text-blue-400" />
                  Recent Activity
                </h2>
                <button 
                  onClick={() => navigate('/client/submissions')}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-300"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-white">{activity.problem}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                            {activity.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {activity.score > 0 && (
                          <span className="text-yellow-400 font-bold">{activity.score}%</span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <HiFire className="mr-2 text-orange-400" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/client/practice')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  🎯 Start New Problem
                </button>
                <button 
                  onClick={() => navigate('/client/practice')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
                >
                  📝 Continue Practice
                </button>
                <button 
                  onClick={() => navigate('/client/contests')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
                >
                  🏆 View Contests
                </button>
              </div>
            </div>

            {/* Available Contests */}
            {availableContests.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <HiTrophy className="mr-2 text-yellow-400" />
                  Upcoming Contests
                </h2>
                <div className="space-y-3">
                  {availableContests.slice(0, 2).map((contest) => (
                    <div key={contest._id} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                      <h3 className="font-semibold text-white mb-1">{contest.title}</h3>
                      <p className="text-sm text-gray-300 mb-2">{contest.problems.length} problems</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-yellow-400">
                          {formatDate(contest.startDate)}
                        </span>
                        <span className="text-gray-400">{contest.duration}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => navigate('/client/contests')}
                    className="w-full text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors duration-300"
                  >
                    View All Contests →
                  </button>
                </div>
              </div>
            )}

            {/* Progress Overview */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <HiChartBar className="mr-2 text-green-400" />
                Weekly Progress
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-medium">Problems Solved</span>
                    <span className="text-white font-bold">12/15</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-400">
                  <span className="text-green-400 font-medium">+25%</span> from last week
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <HiStar className="text-xl" />
                  </div>
                  <h3 className="font-bold text-lg">Streak Master!</h3>
                </div>
                <p className="text-sm opacity-90 mb-3">
                  Amazing! You've maintained a 7-day solving streak. Keep the momentum going! 🔥
                </p>
                <div className="flex items-center text-xs opacity-75">
                  <HiCalendar className="mr-1" />
                  <span>Started Jan 15, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Problems */}
        <div className="mt-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <HiCode className="mr-3 text-purple-400" />
                Recommended for You
              </h2>
              <button 
                onClick={() => navigate('/client/practice')}
                className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors duration-300"
              >
                View All Problems →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProblems.map((problem) => (
                <div 
                  key={problem._id} 
                  onClick={() => navigate('/client/practice/compiler', { state: { problem } })}
                  className="bg-gray-800/50 border border-gray-600 rounded-xl p-4 hover:border-gray-500 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                      {problem.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {problem.description.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.slice(0, 2).map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-yellow-400 font-medium text-sm">Solve →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
