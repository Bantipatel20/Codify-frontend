// src/components/client/PracticeProblems.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCode, HiFilter, HiSearch, HiPlay,  HiStar, HiRefresh } from 'react-icons/hi';
import { problemsAPI } from '../../services/api'; // Import your API service

const PracticeProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [availableTags, setAvailableTags] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });

  useEffect(() => {
    fetchProblems();
    fetchTags();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchTerm, difficultyFilter, tagFilter]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use your API service instead of direct axios
      const response = await problemsAPI.getAllProblems({
        limit: 100,
        page: 1
      });

      if (response.success) {
        const problemsData = response.data.map(problem => ({
          ...problem,
          solved: Math.random() > 0.7, // Mock solved status
          attempts: Math.floor(Math.random() * 5)
        }));
        
        setProblems(problemsData);
        
        // Calculate stats
        const total = problemsData.length;
        const solved = problemsData.filter(p => p.solved).length;
        const easy = problemsData.filter(p => p.difficulty === 'Easy').length;
        const medium = problemsData.filter(p => p.difficulty === 'Medium').length;
        const hard = problemsData.filter(p => p.difficulty === 'Hard').length;
        
        setStats({ total, solved, easy, medium, hard });
      } else {
        throw new Error(response.error || 'Failed to fetch problems');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please make sure your backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      // Use your API service instead of direct axios
      const response = await problemsAPI.getAllTags();
      
      if (response.success && response.data) {
        setAvailableTags(['All', ...response.data]);
      } else {
        // Fallback tags if API fails
        setAvailableTags(['All', 'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Tree', 'Graph']);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      // Use fallback tags
      setAvailableTags(['All', 'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Tree', 'Graph']);
    }
  };

  // Rest of your component code remains the same...
  const filterProblems = () => {
    let filtered = problems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(problem => problem.difficulty === difficultyFilter);
    }

    // Filter by tag
    if (tagFilter !== 'All') {
      filtered = filtered.filter(problem => 
        problem.tags?.includes(tagFilter.toLowerCase())
      );
    }

    setFilteredProblems(filtered);
  };

  const handleSolveProblem = (problem) => {
    navigate('/client/practice/compiler', { state: { problem } });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Enhanced error display with more debugging information
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
              <li>• MongoDB connection is established</li>
              <li>• API routes are properly configured</li>
            </ul>
          </div>
          <button 
            onClick={fetchProblems}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 mx-auto"
          >
            <HiRefresh className="text-lg" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Rest of your component JSX remains exactly the same...
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      {/* Your existing JSX content remains exactly the same */}
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <HiCode className="text-blue-400 text-xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Solved</p>
                <p className="text-2xl font-bold text-green-400">{stats.solved}</p>
              </div>
              <HiStar className="text-green-400 text-xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Easy</p>
                <p className="text-2xl font-bold text-green-400">{stats.easy}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Medium</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.medium}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Hard</p>
                <p className="text-2xl font-bold text-red-400">{stats.hard}</p>
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HiFilter className="text-blue-400 text-xl" />
            <h3 className="text-lg font-semibold text-white">Filter Problems</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('All');
                setTagFilter('All');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">
              Problems ({filteredProblems.length} of {problems.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {filteredProblems.map((problem) => (
              <div key={problem._id} className="p-6 hover:bg-white/5 transition-all duration-300">
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
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {problem.description.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span>📈 {problem.totalSubmissions || 0} submissions</span>
                      <span>✅ {problem.successRate || 0}% success rate</span>
                      <span>🎯 {problem.attempts} attempts</span>
                      {problem.solved && <span className="text-green-400">✅ Solved</span>}
                    </div>
                    
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{problem.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleSolveProblem(problem)}
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
