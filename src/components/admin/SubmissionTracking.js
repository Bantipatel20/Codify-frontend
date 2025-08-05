// src/components/admin/SubmissionTracking.js
import React, { useState } from 'react';
import { HiChartBar, HiFilter, HiDownload, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi';

const submissions = [
  { id: 1, student: '23cs058', problem: 'Two Sum', status: 'Passed', score: 100, time: '2 mins', date: '2024-01-15' },
  { id: 2, student: '23cs060', problem: 'Add Two Numbers', status: 'Failed', score: 50, time: '5 mins', date: '2024-01-15' },
  { id: 3, student: '23cs042', problem: 'Longest Substring', status: 'Passed', score: 90, time: '8 mins', date: '2024-01-14' },
  { id: 4, student: '23cs058', problem: 'Add Two Numbers', status: 'Passed', score: 80, time: '6 mins', date: '2024-01-14' },
  { id: 5, student: '23cs060', problem: 'Two Sum', status: 'Passed', score: 60, time: '4 mins', date: '2024-01-13' },
];

const SubmissionTracking = () => {
  const uniqueProblems = [...new Set(submissions.map((submission) => submission.problem))];
  const [selectedProblem, setSelectedProblem] = useState(uniqueProblems[0] || '');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleProblemChange = (e) => {
    setSelectedProblem(e.target.value);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed': return <HiCheckCircle className="text-green-400" />;
      case 'Failed': return <HiXCircle className="text-red-400" />;
      case 'Pending': return <HiClock className="text-yellow-400" />;
      default: return <HiClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesProblem = submission.problem === selectedProblem;
    const matchesStatus = statusFilter === 'All' || submission.status === statusFilter;
    return matchesProblem && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-4">
            <HiChartBar className="text-2xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Submission Analytics</h1>
          <p className="text-gray-300 text-lg">Monitor and analyze student code submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center space-x-3">
              <HiFilter className="text-blue-400 text-xl" />
              <span className="text-white font-medium">Filters:</span>
            </div>
            
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-300 mb-2">Problem</label>
              <select 
                value={selectedProblem}
                onChange={handleProblemChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                {uniqueProblems.map((problem) => (
                  <option key={problem} value={problem}>{problem}</option>
                ))}
              </select>
            </div>

            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="All">All Statuses</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <HiDownload className="text-lg" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Submissions', value: filteredSubmissions.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'Passed', value: filteredSubmissions.filter(s => s.status === 'Passed').length, color: 'from-green-500 to-emerald-500' },
            { label: 'Failed', value: filteredSubmissions.filter(s => s.status === 'Failed').length, color: 'from-red-500 to-pink-500' },
            { label: 'Avg Score', value: Math.round(filteredSubmissions.reduce((acc, s) => acc + s.score, 0) / filteredSubmissions.length) + '%', color: 'from-yellow-500 to-orange-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <HiChartBar className="text-white text-xl" />
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
              {selectedProblem} Submissions
            </h2>
            <span className="text-gray-400 text-sm">
              {filteredSubmissions.length} results
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time Taken</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-white/5 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {submission.student.slice(-2)}
                          </span>
                        </div>
                        <span className="text-white font-medium">{submission.student}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="text-sm font-medium">{submission.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${getScoreColor(submission.score)}`}>
                          {submission.score}%
                        </span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${submission.score >= 70 ? 'bg-green-500' : submission.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${submission.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{submission.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{submission.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionTracking;
