// src/components/client/Compiler.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiPlay, HiUpload, HiCode, HiLightBulb, HiArrowLeft, HiClock, HiChevronDown, HiCheck } from 'react-icons/hi';
import axios from 'axios';

const Compiler = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const problem = state?.problem;
  const dropdownRef = useRef(null);

  // Language and code states
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced code templates with better starting code
  const codeTemplates = useCallback(() => ({
    javascript: `// Two Sum Problem - JavaScript
function twoSum(nums, target) {
    // Write your solution here
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}

// Test with example
const nums = [2, 7, 11, 15];
const target = 9;
console.log(twoSum(nums, target));`,

    python: `# Two Sum Problem - Python
def two_sum(nums, target):
    # Write your solution here
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    
    return []

# Test with example
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))`,

    java: `// Two Sum Problem - Java
import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        
        return new int[0];
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`,

    cpp: `// Two Sum Problem - C++
#include <vector>
#include <unordered_map>
#include <iostream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    unordered_map<int, int> map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    
    cout << "[";
    for(int i = 0; i < result.size(); i++) {
        cout << result[i];
        if(i < result.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
    return 0;
}`,

    c: `// Two Sum Problem - C
#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    
    return result;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    
    printf("[%d, %d]\\n", result[0], result[1]);
    free(result);
    return 0;
}`,

    go: `// Two Sum Problem - Go
package main

import "fmt"

func twoSum(nums []int, target int) []int {
    // Write your solution here
    numMap := make(map[int]int)
    
    for i, num := range nums {
        complement := target - num
        if index, exists := numMap[complement]; exists {
            return []int{index, i}
        }
        numMap[num] = i
    }
    
    return []int{}
}

func main() {
    nums := []int{2, 7, 11, 15}
    target := 9
    result := twoSum(nums, target)
    fmt.Println(result)
}`,

    ruby: `# Two Sum Problem - Ruby
def two_sum(nums, target)
    # Write your solution here
    num_map = {}
    
    nums.each_with_index do |num, i|
        complement = target - num
        return [num_map[complement], i] if num_map.key?(complement)
        num_map[num] = i
    end
    
    []
end

# Test with example
nums = [2, 7, 11, 15]
target = 9
puts two_sum(nums, target).inspect`,

    php: `<?php
// Two Sum Problem - PHP
function twoSum($nums, $target) {
    // Write your solution here
    $map = array();
    
    for ($i = 0; $i < count($nums); $i++) {
        $complement = $target - $nums[$i];
        if (array_key_exists($complement, $map)) {
            return array($map[$complement], $i);
        }
        $map[$nums[$i]] = $i;
    }
    
    return array();
}

// Test with example
$nums = array(2, 7, 11, 15);
$target = 9;
$result = twoSum($nums, $target);
print_r($result);
?>`
  }), []);

  const defaultTestCase = { nums: [2, 7, 11, 15], target: 9 };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch available languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        console.log('🔄 Attempting to fetch languages from local server...');
        // Updated to use local server endpoint
        const response = await axios.get('/api/compile/languages');
        if (response.data.success) {
          console.log('✅ Successfully fetched languages from local server:', response.data.data.languages);
          setLanguages(response.data.data.languages);
        }
      } catch (err) {
        console.error('❌ Failed to fetch languages from local server:', err);
        console.log('🔄 Using fallback languages...');
        setLanguages([
          { name: 'JavaScript', key: 'javascript', version: 'Node.js' },
          { name: 'Python', key: 'python', version: '3.x' },
          { name: 'Java', key: 'java', version: 'JDK 11+' },
          { name: 'C++', key: 'cpp', version: 'GCC' },
          { name: 'C', key: 'c', version: 'GCC' },
          { name: 'Go', key: 'go', version: '1.x' },
          { name: 'Ruby', key: 'ruby', version: '2.x+' },
          { name: 'PHP', key: 'php', version: '7.x+' }
        ]);
      }
    };

    fetchLanguages();
  }, []);

  // Set initial code template when language changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      const templates = codeTemplates();
      if (selectedLanguage && templates[selectedLanguage]) {
        setCode(templates[selectedLanguage]);
      }
    }
  }, [selectedLanguage, codeTemplates, isInitialized]);

  // Set initial language and code (only runs once when languages are loaded)
  useEffect(() => {
    if (languages.length > 0 && !isInitialized) {
      const templates = codeTemplates();
      const defaultLang = languages.find(lang => lang.key === 'javascript') || languages[0];
      console.log('🚀 Setting initial language:', defaultLang);
      setSelectedLanguage(defaultLang.key);
      setCode(templates[defaultLang.key] || '// Write your code here');
      setIsInitialized(true);
    }
  }, [languages, codeTemplates, isInitialized]);

  const handleLanguageChange = (languageKey) => {
    console.log('🔄 Changing language to:', languageKey);
    const templates = codeTemplates();
    setSelectedLanguage(languageKey);
    setCode(templates[languageKey] || '// Write your code here');
    setShowLanguageDropdown(false);
    setOutput('');
    setError('');
  };

 const handleRun = async () => {
  setError('');
  setOutput('');
  setIsRunning(true);

  try {
    console.log('▶️ Running code with language:', selectedLanguage);
    console.log('📝 Code to execute:', code);
    
    const requestData = {
      lang: selectedLanguage,
      code: code,
      input: JSON.stringify(defaultTestCase)
    };
    
    console.log('📤 Sending request data to local server:', requestData);
    
    const response = await axios.post('/api/compile', requestData);
    
    console.log('📥 Full response received from local server:', response.data);
    
    // Handle your server's response structure
    if (response.data && response.data.success === true) {
      // Check if data exists and has output
      if (response.data.data) {
        // Check for different possible output field names
        const output = response.data.data.output || 
                      response.data.data.result || 
                      response.data.data.stdout || 
                      response.data.data.compilationResult ||
                      'Code executed successfully (no output)';
        
        console.log('✅ Code executed successfully');
        setOutput('✅ Output:\n' + output);
      } else {
        // Data field doesn't exist, check direct fields
        const output = response.data.output || 
                      response.data.result || 
                      response.data.stdout ||
                      'Code executed successfully (no output)';
        
        console.log('✅ Code executed successfully (direct output)');
        setOutput('✅ Output:\n' + output);
      }
    } else if (response.data && response.data.success === false) {
      // Handle error response - prioritize stderr for detailed error info
      const errorMsg = response.data.stderr ||  // Show detailed compilation errors
                      response.data.error || 
                      response.data.message || 
                      response.data.data?.stderr ||
                      response.data.data?.error ||
                      'Compilation failed';
      
      console.log('❌ Compilation failed:', errorMsg);
      setError('❌ Compilation Error:\n' + errorMsg);
    } else {
      // Unknown response structure - show what we got
      console.log('⚠️ Unexpected response structure:', response.data);
      setOutput('⚠️ Unexpected response:\n' + JSON.stringify(response.data, null, 2));
    }
  } catch (err) {
    console.error('❌ Compilation error:', err);
    console.error('❌ Error response:', err.response?.data);
    
    let errorMessage = 'Failed to compile code';
    
    if (err.response?.data) {
      // Prioritize stderr for detailed error messages
      if (err.response.data.stderr) {
        errorMessage = err.response.data.stderr;
      } else if (err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response.data.data?.stderr) {
        errorMessage = err.response.data.data.stderr;
      } else if (err.response.data.data?.error) {
        errorMessage = err.response.data.data.error;
      } else if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError('❌ Compilation Error:\n' + errorMessage);
  } finally {
    setIsRunning(false);
  }
};


const handleSubmit = async () => {
  setError('');
  setOutput('');
  setIsRunning(true);

  try {
    // First compile and run the code
    const compileResponse = await axios.post('/api/compile', {
      lang: selectedLanguage,
      code: code,
      input: JSON.stringify(defaultTestCase)
    });

    console.log('📥 Compile response for submission:', compileResponse.data);

    // Handle your server's response structure
    if (compileResponse.data && compileResponse.data.success === true) {
      // Extract output from your server's response structure
      const compilationOutput = compileResponse.data.data?.output || 
                               compileResponse.data.data?.result || 
                               compileResponse.data.data?.stdout ||
                               compileResponse.data.output || 
                               compileResponse.data.result ||
                               'Code executed successfully';

      // Then submit to your backend
      try {
        const submitResponse = await axios.post('/api/submit', {
          code,
          language: selectedLanguage,
          problemId: problem?.id || 1,
          output: compilationOutput
        });
        
        const status = submitResponse.data?.status || 
                      submitResponse.data?.message || 
                      'Submitted successfully';
        setOutput('🎉 Submission Status: ' + status);
      } catch (submitErr) {
        console.log('⚠️ Submission endpoint not available, showing compilation result instead');
        setOutput('✅ Code compiled and executed successfully:\n' + compilationOutput);
      }
    } else {
      // Handle compilation failure - prioritize stderr for detailed error info
      const errorMsg = compileResponse.data?.stderr ||  // Show detailed compilation errors
                      compileResponse.data?.error || 
                      compileResponse.data?.message || 
                      compileResponse.data?.data?.stderr ||
                      compileResponse.data?.data?.error ||
                      'Compilation failed';
      
      setError('❌ Compilation Error:\n' + errorMsg);
    }
  } catch (err) {
    console.error('❌ Submission error:', err);
    let errorMessage = 'Failed to submit code';
    
    if (err.response?.data) {
      // Prioritize stderr for detailed error messages
      if (err.response.data.stderr) {
        errorMessage = err.response.data.stderr;
      } else if (err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response.data.data?.stderr) {
        errorMessage = err.response.data.data.stderr;
      } else if (err.response.data.data?.error) {
        errorMessage = err.response.data.data.error;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError('❌ Compilation Error:\n' + errorMessage);
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

  const getLanguageIcon = (languageKey) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      go: '🐹',
      ruby: '💎',
      php: '🐘'
    };
    return icons[languageKey] || '📝';
  };

  const selectedLangObj = languages.find(lang => lang.key === selectedLanguage);

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
            {/* Editor Header with Language Selection */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">Code Editor</h2>
              
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLanguageDropdown(!showLanguageDropdown);
                  }}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300 min-w-[140px]"
                >
                  <span className="text-lg">{getLanguageIcon(selectedLanguage)}</span>
                  <span className="text-sm font-medium">{selectedLangObj?.name || 'JavaScript'}</span>
                  <HiChevronDown className={`text-sm transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-400 px-3 py-2 font-medium">
                        Select Language ({languages.length} available)
                      </div>
                      {languages.map((lang) => (
                        <button
                          key={lang.key}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLanguageChange(lang.key);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                            selectedLanguage === lang.key
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <span className="text-lg">{getLanguageIcon(lang.key)}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{lang.name}</div>
                            {lang.version && (
                              <div className="text-xs text-gray-500">{lang.version}</div>
                            )}
                          </div>
                          {selectedLanguage === lang.key && (
                            <HiCheck className="text-blue-400 text-sm" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor */}
            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-gray-900 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Write your ${selectedLangObj?.name || 'code'} solution here...`}
                spellCheck={false}
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
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Output ({selectedLangObj?.name || 'JavaScript'}):
                </h3>
                {isRunning ? (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span>Compiling and running your {selectedLangObj?.name || 'code'}...</span>
                  </div>
                ) : (
                  <div className="text-sm">
                    {error && <div className="text-red-400 whitespace-pre-wrap">{error}</div>}
                    {output && <div className="text-green-400 whitespace-pre-wrap">{output}</div>}
                    {!error && !output && (
                      <div className="text-gray-500">
                        Click "Run Code" to test your {selectedLangObj?.name || 'JavaScript'} solution
                      </div>
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
