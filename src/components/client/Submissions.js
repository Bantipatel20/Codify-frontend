// src/components/client/Submissions.js
import React, { useState } from 'react';
import { HiDocumentText, HiFilter, HiCheckCircle, HiXCircle, HiClock, HiEye } from 'react-icons/hi';

const submissions = [
  { id: 1, problem: 'Two Sum', date: '2025-01-15', time: '14:30', status: 'Accepted', score: 100, language: 'JavaScript', runtime: '68ms' },
  { id: 2, problem: 'Add Two Numbers', date: '2025-01-14', time: '16:45', status: 'Wrong Answer', score: 0, language: 'JavaScript', runtime: 'N/A' },
  { id: 3, problem: 'Longest Substring', date: '2025-01-13', time: '10:20', status: 'Accepted', score: 95, language: 'Python', runtime: '124ms' },
  { id: 4, problem: 'Valid Parentheses', date: '2025-01-12', time: '09:15', status: 'Time Limit Exceeded', score: 0, language: 'JavaScript', runtime: 'N/A' },
  { id: 5, problem: 'Binary Search', date: '2025-01-11', time: '18:30', status: 'Accepted', score: 100, language: 'JavaScript', runtime: '45ms' },
  { id: 6, problem: 'Merge Sort', date: '2025-01-10', time: '15:20', status: 'Runtime Error', score: 0, language: 'Python', runtime: 'N/A' }
];

const Submissions = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = statusFilter === 'All' || submission.status === statusFilter;
    const matchesLanguage = languageFilter === 'All' || submission.language === languageFilter;
    return matchesStatus && matchesLanguage;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <HiCheckCircle className="text-green-400" />;
      case 'Wrong Answer': return <HiXCircle className="text-red-400" />;
      case 'Time Limit Exceeded': return <HiClock className="text-yellow-400" />;
      case 'Runtime Error': return <HiXCircle className="text-orange-400" />;
      default: return <HiClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Wrong Answer': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Time Limit Exceeded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Runtime Error': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const statuses = ['All', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'];
  const languages = ['All', 'JavaScript', 'Python', 'Java', 'C++'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <HiDocumentText className="text-2xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">My Submissions</h1>
          <p className="text-gray-300 text-xl">Track your coding journey and progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Submissions</p>
                <p className="text-2xl font-bold text-white">{submissions.length}</p>
              </div>
              <HiDocumentText className="text-blue-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Accepted</p>
                <p className="text-2xl font-bold text-green-400">
                  {submissions.filter(s => s.status === 'Accepted').length}
                </p>
              </div>
              <HiCheckCircle className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100)}%
                </p>
              </div>
              <div className="text-yellow-400 text-2xl">📊</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)}
                </p>
              </div>
              <div className="text-purple-400 text-2xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HiFilter className="text-blue-400 text-xl" />
            <h3 className="text-lg font-semibold text-white">Filter Submissions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">
              Submission History ({filteredSubmissions.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Language</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Runtime</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-white/5 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{submission.problem}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span>{submission.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${submission.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {submission.score}
                        </span>
                        {submission.score > 0 && (
                          <div className="w-12 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${submission.score}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-sm">
                        {submission.language}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${submission.runtime !== 'N/A' ? 'text-blue-400' : 'text-gray-400'}`}>
                        {submission.runtime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">
                        <div>{submission.date}</div>
                        <div className="text-gray-400">{submission.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                        <HiEye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiDocumentText className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Submissions Found</h3>
            <p className="text-gray-400">Try adjusting your filter criteria or start solving problems!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
