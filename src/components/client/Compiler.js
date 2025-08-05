// src/components/client/Compiler.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiPlay, HiUpload, HiCode, HiLightBulb, HiArrowLeft, HiClock } from 'react-icons/hi';
import axios from 'axios';

const Compiler = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const problem = state?.problem;

  const [code, setCode] = useState('// Write your solution here\nfunction twoSum(nums, target) {\n    \n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');

  const defaultTestCase = { nums: [2, 7, 11, 15], target: 9 };

  const handleRun = async () => {
    setError('');
    setOutput('');
    setIsRunning(true);

    try {
      const response = await axios.post('http://localhost:5000/api/run', {
        code,
        testCase: defaultTestCase,
      });
      setOutput('✅ Output: ' + JSON.stringify(response.data.output));
    } catch (err) {
      setError('❌ Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setOutput('');
    setIsRunning(true);

    try {
      const response = await axios.post('http://localhost:5000/api/submit', {
        code,
        problemId: problem?.id || 1,
      });
      setOutput('🎉 Submission Status: ' + response.data.status);
    } catch (err) {
      setError('❌ Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/client/practice')}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
            >
              <HiArrowLeft className="text-lg" />
              <span>Back to Problems</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <HiCode className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{problem?.title || 'Two Sum Problem'}</h1>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem?.difficulty || 'Easy')}`}>
                    {problem?.difficulty || 'Easy'}
                  </span>
                  <span className="text-gray-400 text-sm">💰 {problem?.points || 100} points</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <HiClock className="text-lg" />
            <span>Time: 00:00</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Problem Description */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/20">
              <button 
                onClick={() => setActiveTab('problem')}
                className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
                  activeTab === 'problem' 
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                📋 Problem
              </button>
              <button 
                onClick={() => setActiveTab('examples')}
                className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
                  activeTab === 'examples' 
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                💡 Examples
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'problem' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Problem Description</h2>
                    <p className="text-gray-300 leading-relaxed">
                      {problem?.description || 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.'}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <HiLightBulb className="mr-2 text-yellow-400" />
                      Constraints
                    </h3>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• 2 ≤ nums.length ≤ 10⁴</li>
                      <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                      <li>• -10⁹ ≤ target ≤ 10⁹</li>
                      <li>• Only one valid answer exists</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Example 1:</h3>
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
                      <div className="space-y-2 text-sm">
                        <div><span className="text-blue-400">Input:</span> <span className="text-gray-300">nums = [2,7,11,15], target = 9</span></div>
                        <div><span className="text-green-400">Output:</span> <span className="text-gray-300">[0,1]</span></div>
                        <div><span className="text-yellow-400">Explanation:</span> <span className="text-gray-300">Because nums[0] + nums[1] == 9, we return [0, 1].</span></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Example 2:</h3>
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
                      <div className="space-y-2 text-sm">
                        <div><span className="text-blue-400">Input:</span> <span className="text-gray-300">nums = [3,2,4], target = 6</span></div>
                        <div><span className="text-green-400">Output:</span> <span className="text-gray-300">[1,2]</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">Code Editor</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">JavaScript</span>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-gray-900 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your code here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  <HiPlay className="text-lg" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  <HiUpload className="text-lg" />
                  <span>{isRunning ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>

              {/* Output */}
              <div className="bg-gray-900 border border-gray-600 rounded-xl p-4 min-h-24">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Output:</h3>
                {isRunning ? (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span>Running your code...</span>
                  </div>
                ) : (
                  <div className="text-sm">
                    {error && <div className="text-red-400 whitespace-pre-wrap">{error}</div>}
                    {output && <div className="text-green-400 whitespace-pre-wrap">{output}</div>}
                    {!error && !output && (
                      <div className="text-gray-500">Click "Run Code" to test your solution</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;
