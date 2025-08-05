// src/components/client/PracticeProblems.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCode, HiFilter, HiSearch, HiPlay, HiFire, HiStar } from 'react-icons/hi';

const problems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Array', points: 100, solved: true, attempts: 3 },
  { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', points: 200, solved: false, attempts: 1 },
  { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'String', points: 250, solved: true, attempts: 5 },
  { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Array', points: 400, solved: false, attempts: 0 },
  { id: 5, title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', points: 100, solved: true, attempts: 2 },
  { id: 6, title: 'Binary Search', difficulty: 'Easy', category: 'Search', points: 150, solved: false, attempts: 0 }
];

const PracticeProblems = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'All' || problem.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = ['All', ...new Set(problems.map(p => p.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  function gotoCompilerHandler(problem) {
    navigate('/client/practice/complier', { state: { problem } });
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
            <HiCode className="text-2xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Practice Arena</h1>
          <p className="text-gray-300 text-xl">Sharpen your coding skills with challenging problems</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Problems</p>
                <p className="text-2xl font-bold text-white">{problems.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <HiCode className="text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Solved</p>
                <p className="text-2xl font-bold text-green-400">
                  {problems.filter(p => p.solved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <HiStar className="text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round((problems.filter(p => p.solved).length / problems.length) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <HiFire className="text-yellow-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HiFilter className="text-blue-400 text-xl" />
            <h3 className="text-lg font-semibold text-white">Filter Problems</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">
              Problems ({filteredProblems.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {filteredProblems.map((problem) => (
              <div key={problem.id} className="p-6 hover:bg-white/5 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        {problem.solved && <HiStar className="text-yellow-400" />}
                        <h3 className={`text-lg font-semibold ${problem.solved ? 'text-green-400' : 'text-white'}`}>
                          {problem.title}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {problem.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span>💰 {problem.points} points</span>
                      <span>🎯 {problem.attempts} attempts</span>
                      {problem.solved && <span className="text-green-400">✅ Solved</span>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => gotoCompilerHandler(problem)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      problem.solved 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <HiPlay className="text-lg" />
                    <span>{problem.solved ? 'Review' : 'Solve'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiSearch className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Problems Found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeProblems;
