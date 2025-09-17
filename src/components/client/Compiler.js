// src/components/client/Compiler.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiPlay, HiUpload, HiArrowLeft, HiChevronDown, HiCheck, HiBookOpen, HiClipboardList, HiTerminal, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { problemsAPI } from '../../services/api';
import api from '../../services/api';

const Compiler = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const problemFromState = state?.problem;
  const dropdownRef = useRef(null);

  // Problem and UI states
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemError, setProblemError] = useState(null);

  // Language and code states
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('testcase');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Test case execution states
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testSummary, setTestSummary] = useState(null);

  // Fetch problem data from API
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setProblemLoading(true);
        setProblemError(null);
        
        let problemData = null;
        
        if (problemFromState?.id || problemFromState?._id) {
          // Fetch problem by ID if we have it
          const problemId = problemFromState.id || problemFromState._id;
          const response = await problemsAPI.getProblemById(problemId);
          
          if (response.success) {
            problemData = response.data;
          } else {
            throw new Error(response.error || 'Failed to fetch problem');
          }
        } else if (problemFromState) {
          // Use problem data from state if available
          problemData = problemFromState;
        } else {
          // Fallback: fetch a random problem or the first available problem
          const response = await problemsAPI.getAllProblems({ page: 1, limit: 1 });
          if (response.success && response.data.length > 0) {
            problemData = response.data[0];
          } else {
            throw new Error('No problems available');
          }
        }
        
        setProblem(problemData);
      } catch (err) {
        console.error('Error fetching problem:', err);
        setProblemError(err.message || 'Failed to load problem');
        // Set minimal fallback problem data
        setProblem({
          title: 'Problem Not Found',
          difficulty: 'Unknown',
          description: '',
          testCases: []
        });
      } finally {
        setProblemLoading(false);
      }
    };

    fetchProblem();
  }, [problemFromState]);

  // Enhanced code templates based on problem
  const codeTemplates = useCallback(() => {
    if (!problem) return {};
    
    // Default templates for problems
    return {
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

// Write your solution here
int main() {
    // Your code here
    return 0;
}`,

      javascript: `// ${problem.title || 'Problem Solution'}
function solution() {
    // Write your solution here
    
}

// Test your solution
console.log(solution());`,

      python: `# ${problem.title || 'Problem Solution'}
def solution():
    # Write your solution here
    pass

# Test your solution
print(solution())`,

      java: `public class Solution {
    
    public static void main(String[] args) {
        // Write your solution here
        
    }
    
    // Add your solution methods here
}`,

      c: `#include <stdio.h>
#include <stdlib.h>

// Write your solution here
int main() {
    // Your code here
    return 0;
}`,

      go: `package main

import "fmt"

// Write your solution here
func main() {
    // Your code here
    fmt.Println("Hello, World!")
}`,

      ruby: `# ${problem.title || 'Problem Solution'}
def solution
    # Write your solution here
end

# Test your solution
puts solution`,

      php: `<?php
// ${problem.title || 'Problem Solution'}
function solution() {
    // Write your solution here
}

// Test your solution
echo solution();
?>`
    };
  }, [problem]);

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
        const response = await api.get('/compile/languages');
        if (response.data.success) {
          console.log('✅ Successfully fetched languages from local server:', response.data.data.languages);
          setLanguages(response.data.data.languages);
        }
      } catch (err) {
        console.error('❌ Failed to fetch languages from local server:', err);
        console.log('🔄 Using fallback languages...');
        setLanguages([
          { name: 'C++', key: 'cpp', version: 'GCC 9.2.0' },
          { name: 'Java', key: 'java', version: 'OpenJDK 13.0.1' },
          { name: 'Python3', key: 'python', version: '3.8.1' },
          { name: 'C', key: 'c', version: 'GCC 9.2.0' },
          { name: 'JavaScript', key: 'javascript', version: 'Node.js 12.14.0' },
          { name: 'Go', key: 'go', version: '1.13.5' },
          { name: 'Ruby', key: 'ruby', version: '2.7.0' },
          { name: 'PHP', key: 'php', version: '7.4.1' }
        ]);
      }
    };

    fetchLanguages();
  }, []);

  // Set initial code template when language changes (but not on initial load)
  useEffect(() => {
    if (isInitialized && problem) {
      const templates = codeTemplates();
      if (selectedLanguage && templates[selectedLanguage]) {
        setCode(templates[selectedLanguage]);
      }
    }
  }, [selectedLanguage, codeTemplates, isInitialized, problem]);

  // Set initial language and code (only runs once when languages are loaded)
  useEffect(() => {
    if (languages.length > 0 && !isInitialized && problem) {
      const templates = codeTemplates();
      const defaultLang = languages.find(lang => lang.key === 'cpp') || languages[0];
      console.log('🚀 Setting initial language:', defaultLang);
      setSelectedLanguage(defaultLang.key);
      setCode(templates[defaultLang.key] || '// Write your code here');
      setIsInitialized(true);
    }
  }, [languages, codeTemplates, isInitialized, problem]);

  const handleLanguageChange = (languageKey) => {
    console.log('🔄 Changing language to:', languageKey);
    const templates = codeTemplates();
    setSelectedLanguage(languageKey);
    setCode(templates[languageKey] || '// Write your code here');
    setShowLanguageDropdown(false);
    setOutput('');
    setError('');
    setTestResults([]);
    setTestSummary(null);
  };

  // Function to run code against all test cases
  const runTestCases = async () => {
    if (!problem?.testCases || problem.testCases.length === 0) {
      setError('No test cases available for this problem');
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);
    setTestSummary(null);
    setError('');
    setOutput('');
    setActiveBottomTab('result');

    const results = [];
    let passedCount = 0;
    let totalCount = problem.testCases.length;

    console.log(`🧪 Running ${totalCount} test cases...`);

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      console.log(`🔄 Running test case ${i + 1}/${totalCount}...`);

      try {
        const response = await api.post('/compile', {
          lang: selectedLanguage,
          code: code,
          input: testCase.input || ''
        });

        if (response.data && response.data.success === true) {
          const actualOutput = (response.data.data?.output || response.data.output || '').trim();
          const expectedOutput = (testCase.output || '').trim();
          const passed = actualOutput === expectedOutput;
          
          if (passed) passedCount++;

          results.push({
            testCase: i + 1,
            input: testCase.input || 'No input',
            expectedOutput: expectedOutput || 'No expected output',
            actualOutput: actualOutput || 'No output',
            passed: passed,
            error: null,
            executionTime: response.data.executionTime || 'N/A'
          });

          console.log(`${passed ? '✅' : '❌'} Test case ${i + 1}: ${passed ? 'PASSED' : 'FAILED'}`);
        } else {
          const errorMsg = response.data?.stderr || response.data?.error || 'Execution failed';
          results.push({
            testCase: i + 1,
            input: testCase.input || 'No input',
            expectedOutput: testCase.output || 'No expected output',
            actualOutput: '',
            passed: false,
            error: errorMsg,
            executionTime: 'N/A'
          });
          console.log(`❌ Test case ${i + 1}: ERROR - ${errorMsg}`);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.stderr || err.response?.data?.error || err.message || 'Network error';
        results.push({
          testCase: i + 1,
          input: testCase.input || 'No input',
          expectedOutput: testCase.output || 'No expected output',
          actualOutput: '',
          passed: false,
          error: errorMsg,
          executionTime: 'N/A'
        });
        console.log(`❌ Test case ${i + 1}: ERROR - ${errorMsg}`);
      }

      // Update results incrementally
      setTestResults([...results]);
    }

    // Set final summary
    const summary = {
      total: totalCount,
      passed: passedCount,
      failed: totalCount - passedCount,
      percentage: Math.round((passedCount / totalCount) * 100)
    };

    setTestSummary(summary);
    setIsRunningTests(false);

    console.log(`🏁 Test execution completed: ${passedCount}/${totalCount} passed (${summary.percentage}%)`);
  };

  // Regular run function (for single execution without test cases)
  const handleRun = async () => {
    setError('');
    setOutput('');
    setIsRunning(true);
    setActiveBottomTab('result');
    setTestResults([]);
    setTestSummary(null);

    try {
      console.log('▶️ Running code with language:', selectedLanguage);
      
      const requestData = {
        lang: selectedLanguage,
        code: code,
        input: ''
      };
      
      const response = await api.post('/compile', requestData);
      
      if (response.data && response.data.success === true) {
        const output = response.data.data?.output || 
                      response.data.output || 
                      'Code executed successfully';
        
        setOutput(output);
        console.log('✅ Code execution successful:', output);
      } else {
        const errorMsg = response.data?.stderr ||  
                        response.data?.error || 
                        response.data?.message || 
                        'Compilation failed';
        
        setError(errorMsg);
        console.log('❌ Code execution failed:', errorMsg);
      }
    } catch (err) {
      console.error('❌ Compilation error:', err);
      let errorMessage = 'Failed to compile code';
      
      if (err.response?.data?.stderr) {
        errorMessage = err.response.data.stderr;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    // First run all test cases
    await runTestCases();
    
    // Then attempt to submit if there are any passed test cases
    if (testSummary && testSummary.passed > 0) {
      try {
        const submitResponse = await api.post('/api/submissions/submit', {
          code,
          language: selectedLanguage,
          problemId: problem?._id || problem?.id,
          userId: JSON.parse(localStorage.getItem('user'))?._id,
          testResults: testResults,
          summary: testSummary
        });
        
        const status = submitResponse.data?.status || 'Submitted successfully';
        setOutput(prev => `🎉 Submission Status: ${status}\n\n${prev}`);
      } catch (submitErr) {
        console.log('⚠️ Submission endpoint not available');
        // Don't show error, just show test results
      }
    }
  };

  const getLanguageIcon = (languageKey) => {
    const icons = {
      cpp: '⚡',
      java: '☕',
      python: '🐍',
      c: '🔧',
      csharp: '💙',
      javascript: '🟨',
      ruby: '💎',
      swift: '🚀',
      go: '🐹',
      scala: '🎯',
      kotlin: '🟣',
      rust: '🦀',
      php: '🐘',
      typescript: '🔷'
    };
    return icons[languageKey] || '📝';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Hard': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const selectedLangObj = languages.find(lang => lang.key === selectedLanguage);

  if (problemLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/client/practice')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <HiArrowLeft className="text-lg" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {problem?.title || 'Problem'}
              </h1>
              {problem?.difficulty && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              )}
            </div>
          </div>
          {problemError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Problem data may be incomplete
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Single Tab */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400">
              <HiBookOpen className="text-lg" />
              <span>Description</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Problem Description */}
              {problem?.description && (
                <div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {problem.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Show message if no description */}
              {!problem?.description && (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    No description available for this problem.
                  </div>
                </div>
              )}

              {/* Test Cases Examples */}
              {problem?.testCases && problem.testCases.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Examples:</h3>
                  <div className="space-y-4">
                    {problem.testCases.slice(0, 3).map((testCase, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Example {index + 1}:
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Input:</span>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mt-1 font-mono text-xs">
                              {testCase.input || 'No input provided'}
                            </div>
                          </div>
                          <div>
                            <span className="text-green-600 dark:text-green-400 font-medium">Output:</span>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mt-1 font-mono text-xs">
                              {testCase.output || 'No output provided'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {problem.testCases.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ... and {problem.testCases.length - 3} more test cases
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {problem?.tags && problem.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 bg-white dark:bg-gray-800 flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Code</h2>
              
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLanguageDropdown(!showLanguageDropdown);
                  }}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <span>{getLanguageIcon(selectedLanguage)}</span>
                  <span>{selectedLangObj?.name || 'C++'}</span>
                  <HiChevronDown className={`text-sm transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.key}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLanguageChange(lang.key);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                          selectedLanguage === lang.key ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <span>{getLanguageIcon(lang.key)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{lang.version}</div>
                        </div>
                        {selectedLanguage === lang.key && (
                          <HiCheck className="text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm p-4 resize-none focus:outline-none border-none"
              placeholder={`Write your ${selectedLangObj?.name || 'C++'} solution here...`}
              spellCheck={false}
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400">
              Lines: {code.split('\n').length}
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Bottom Tabs */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900">
              <div className="flex">
                <button 
                  onClick={() => setActiveBottomTab('testcase')}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    activeBottomTab === 'testcase' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <HiClipboardList className="text-sm" />
                  <span>Testcase</span>
                </button>
                <button 
                  onClick={() => setActiveBottomTab('result')}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    activeBottomTab === 'result' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <HiTerminal className="text-sm" />
                  <span>Test Result</span>
                  {testSummary && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      testSummary.passed === testSummary.total 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {testSummary.passed}/{testSummary.total}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning || isRunningTests}
                  className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <HiPlay className="text-sm" />
                  <span>{isRunning ? 'Running...' : 'Run'}</span>
                </button>
                <button
                  onClick={runTestCases}
                  disabled={isRunning || isRunningTests || !problem?.testCases?.length}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <HiCheckCircle className="text-sm" />
                  <span>{isRunningTests ? 'Testing...' : 'Test'}</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning || isRunningTests}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <HiUpload className="text-sm" />
                  <span>{isRunningTests ? 'Testing...' : 'Submit'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="h-48 p-4 bg-white dark:bg-gray-800 overflow-y-auto">
              {activeBottomTab === 'testcase' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Test Cases ({problem?.testCases?.length || 0})
                    </h3>
                  </div>
                  {problem?.testCases && problem.testCases.length > 0 ? (
                    <div className="space-y-3">
                      {problem.testCases.slice(0, 2).map((testCase, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Case {index + 1}:
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">Input:</div>
                              <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                {testCase.input || 'No input'}
                              </pre>
                            </div>
                            <div>
                              <div className="text-xs text-green-600 dark:text-green-400">Expected Output:</div>
                              <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                {testCase.output || 'No output'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                      {problem.testCases.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          ... and {problem.testCases.length - 2} more test cases
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No test cases available
                    </div>
                  )}
                </div>
              )}
              
              {activeBottomTab === 'result' && (
                <div>
                  {(isRunning || isRunningTests) ? (
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
                      <span className="text-sm">
                        {isRunningTests ? 'Running test cases...' : 'Running your code...'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm">
                      {/* Test Results */}
                      {testResults.length > 0 && (
                        <div className="space-y-3">
                          {/* Summary */}
                          {testSummary && (
                            <div className={`p-3 rounded-lg ${
                              testSummary.passed === testSummary.total 
                                ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                                : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {testSummary.passed === testSummary.total ? (
                                    <HiCheckCircle className="text-green-600 dark:text-green-400" />
                                  ) : (
                                    <HiXCircle className="text-red-600 dark:text-red-400" />
                                  )}
                                  <span className={`font-medium ${
                                    testSummary.passed === testSummary.total 
                                      ? 'text-green-800 dark:text-green-200' 
                                      : 'text-red-800 dark:text-red-200'
                                  }`}>
                                    {testSummary.passed === testSummary.total ? 'All Tests Passed!' : 'Some Tests Failed'}
                                  </span>
                                </div>
                                <span className={`text-sm ${
                                  testSummary.passed === testSummary.total 
                                    ? 'text-green-700 dark:text-green-300' 
                                    : 'text-red-700 dark:text-red-300'
                                }`}>
                                  {testSummary.passed}/{testSummary.total} ({testSummary.percentage}%)
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Individual Test Results */}
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {testResults.map((result, index) => (
                              <div key={index} className={`p-2 rounded border text-xs ${
                                result.passed 
                                  ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' 
                                  : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">Test Case {result.testCase}</span>
                                  <div className="flex items-center space-x-1">
                                    {result.passed ? (
                                      <HiCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                                    ) : (
                                      <HiXCircle className="text-red-600 dark:text-red-400 text-sm" />
                                    )}
                                    <span className={result.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                                      {result.passed ? 'PASS' : 'FAIL'}
                                    </span>
                                  </div>
                                </div>
                                {!result.passed && result.error && (
                                  <div className="text-red-600 dark:text-red-400 font-mono">
                                    Error: {result.error}
                                  </div>
                                )}
                                {!result.error && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <div className="text-blue-600 dark:text-blue-400">Expected:</div>
                                      <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded font-mono">
                                        {result.expectedOutput}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-orange-600 dark:text-orange-400">Actual:</div>
                                      <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded font-mono">
                                        {result.actualOutput}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regular execution error */}
                      {error && testResults.length === 0 && (
                        <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
                          <div className="text-xs text-red-500 dark:text-red-400 mb-2">❌ Compilation Error:</div>
                          {error}
                        </div>
                      )}

                      {/* Regular execution output */}
                      {output && testResults.length === 0 && (
                        <div className="text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">
                          <div className="text-xs text-green-500 dark:text-green-400 mb-2">✅ Output:</div>
                          {output}
                        </div>
                      )}

                      {/* Default state */}
                      {!error && !output && testResults.length === 0 && (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                          <div className="text-2xl mb-2">🚀</div>
                          <div>Ready to test your solution</div>
                          <div className="text-xs mt-1">
                            Click "Run" for single execution or "Test" to run against all test cases
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;
