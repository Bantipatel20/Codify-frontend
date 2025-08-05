// src/components/client/PerformanceTracking.js
import React, { useState } from 'react';
import { HiChartBar, HiTrendingUp, HiTrendingDown, HiCalendar, HiStar, HiFire } from 'react-icons/hi';

const performanceData = [
  { id: 1, date: '2025-01-15', score: 95, problems: 3, timeSpent: 120, difficulty: 'Medium' },
  { id: 2, date: '2025-01-14', score: 87, problems: 2, timeSpent: 90, difficulty: 'Easy' },
  { id: 3, date: '2025-01-13', score: 92, problems: 4, timeSpent: 180, difficulty: 'Hard' },
  { id: 4, date: '2025-01-12', score: 78, problems: 2, timeSpent: 75, difficulty: 'Easy' },
  { id: 5, date: '2025-01-11', score: 88, problems: 3, timeSpent: 135, difficulty: 'Medium' },
  { id: 6, date: '2025-01-10', score: 91, problems: 5, timeSpent: 200, difficulty: 'Hard' }
];

const weeklyStats = [
  { week: 'Week 1', problems: 15, avgScore: 89, timeSpent: 480 },
  { week: 'Week 2', problems: 12, avgScore: 85, timeSpent: 420 },
  { week: 'Week 3', problems: 18, avgScore: 92, timeSpent: 540 },
  { week: 'Week 4', problems: 14, avgScore: 87, timeSpent: 460 }
];

const PerformanceTracking = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const totalProblems = performanceData.reduce((sum, day) => sum + day.problems, 0);
  const avgScore = Math.round(performanceData.reduce((sum, day) => sum + day.score, 0) / performanceData.length);
  const totalTime = performanceData.reduce((sum, day) => sum + day.timeSpent, 0);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4">
            <HiChartBar className="text-2xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Performance Analytics</h1>
          <p className="text-gray-300 text-xl">Track your coding progress and identify improvement areas</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Problems</p>
                <p className="text-3xl font-bold text-white">{totalProblems}</p>
                <div className="flex items-center mt-2">
                  <HiTrendingUp className="text-green-400 text-sm mr-1" />
                  <span className="text-green-400 text-sm">+12% this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <HiStar className="text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Average Score</p>
                <p className="text-3xl font-bold text-green-400">{avgScore}%</p>
                <div className="flex items-center mt-2">
                  <HiTrendingUp className="text-green-400 text-sm mr-1" />
                  <span className="text-green-400 text-sm">+5% this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <HiTrendingUp className="text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Time Spent</p>
                <p className="text-3xl font-bold text-purple-400">{Math.round(totalTime / 60)}h</p>
                <div className="flex items-center mt-2">
                  <HiTrendingDown className="text-red-400 text-sm mr-1" />
                  <span className="text-red-400 text-sm">-8% this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <HiCalendar className="text-purple-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-orange-400">7</p>
                <div className="flex items-center mt-2">
                  <HiFire className="text-orange-400 text-sm mr-1" />
                  <span className="text-orange-400 text-sm">days</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <HiFire className="text-orange-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📅 Daily Performance
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'weekly'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📊 Weekly Trends
            </button>
          </div>
        </div>

        {/* Daily Performance Tab */}
        {activeTab === 'daily' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">Daily Performance Breakdown</h2>
              <p className="text-gray-400 mt-2">Your coding activity over the past week</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problems Solved</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time Spent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Difficulty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {performanceData.map((data) => (
                    <tr key={data.id} className="hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{data.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400 font-bold text-lg">{data.problems}</span>
                          <span className="text-gray-400 text-sm">problems</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className={`text-lg font-bold ${data.score >= 90 ? 'text-green-400' : data.score >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {data.score}%
                          </span>
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${data.score >= 90 ? 'bg-green-500' : data.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${data.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-purple-400 font-medium">{data.timeSpent} min</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(data.difficulty)}`}>
                          {data.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {data.score >= 90 && <span className="text-green-400">🔥</span>}
                          {data.score >= 80 && data.score < 90 && <span className="text-yellow-400">⭐</span>}
                          {data.score < 80 && <span className="text-gray-400">📈</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly Trends Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Weekly Performance Trends</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {weeklyStats.map((week, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">{week.week}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Problems:</span>
                        <span className="text-blue-400 font-medium">{week.problems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Avg Score:</span>
                        <span className="text-green-400 font-medium">{week.avgScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Time:</span>
                        <span className="text-purple-400 font-medium">{Math.round(week.timeSpent / 60)}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Chart Placeholder */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Performance Chart</h3>
              <div className="h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-gray-600">
                <div className="text-center">
                  <HiChartBar className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 font-medium">Interactive Chart Coming Soon</p>
                  <p className="text-gray-500 text-sm">Detailed performance visualization</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTracking;
