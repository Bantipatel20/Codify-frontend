// src/components/client/Compiler.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    HiArrowLeft, 
    HiPlay, 
    HiSave, 
    HiUpload, 
    HiBeaker, 
    HiCode,
    HiX,
    HiCheck,
    HiExclamation,
    HiClock,
    HiChevronUp,
    HiChevronDown,
    HiRefresh
} from 'react-icons/hi';
import { compilerAPI, submissionsAPI, autoSaveAPI, authAPI, problemsAPI } from '../../services/api';

const Compiler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const codeEditorRef = useRef(null);
    const autoSaveIntervalRef = useRef(null);
    
    // Get problem data from location state
    const problem = location.state?.problem;
    const isContestMode = location.state?.isContestMode || false;
    
    // State management
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isCompiling, setIsCompiling] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supportedLanguages, setSupportedLanguages] = useState([
        { key: 'python', name: 'Python 3' },
        { key: 'javascript', name: 'JavaScript' },
        { key: 'java', name: 'Java' },
        { key: 'cpp', name: 'C++' },
        { key: 'c', name: 'C' }
    ]);
    const [currentUser, setCurrentUser] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreOptions, setRestoreOptions] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showSubmissionConfirm, setShowSubmissionConfirm] = useState(false);
    const [testResults, setTestResults] = useState(null);
    
    // UI State
    const [activeTab, setActiveTab] = useState('description');
    const [consoleCollapsed, setConsoleCollapsed] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [problemData, setProblemData] = useState(null);
    const [problemStats, setProblemStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Language templates
    const languageTemplates = {
        python: `def solution():
    # Write your code here
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`,
        javascript: `/**
 * @return {type}
 */
var solution = function() {
    // Write your code here
    
};

// Test your solution
console.log(solution());`,
        java: `class Solution {
    public void solution() {
        // Write your code here
        
    }
}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Test your solution
        System.out.println(sol.solution());
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    void solution() {
        // Write your code here
        
    }
};

int main() {
    Solution sol;
    // Test your solution
    cout << sol.solution() << endl;
    return 0;
}`,
        c: `#include <stdio.h>
#include <stdlib.h>

void solution() {
    // Write your code here
    
}

int main() {
    // Test your solution
    solution();
    return 0;
}`
    };

    // Initialize component
    useEffect(() => {
        const user = authAPI.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);
        
        fetchSupportedLanguages();
        
        if (problem) {
            fetchProblemData();
            checkForRestoreOptions(user._id);
        }
        
        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [problem, navigate]);

    // Fetch complete problem data from database
    const fetchProblemData = async () => {
        try {
            setLoading(true);
            const response = await problemsAPI.getProblemById(problem._id || problem.problemId);
            
            if (response.success) {
                setProblemData(response.data);
                // Fetch statistics
                await fetchProblemStats(response.data._id);
            } else {
                console.error('Failed to fetch problem data:', response.error);
                setProblemData(problem); // Fallback to passed problem data
            }
        } catch (error) {
            console.error('Error fetching problem data:', error);
            setProblemData(problem); // Fallback to passed problem data
        } finally {
            setLoading(false);
        }
    };

    // Fetch problem statistics
    const fetchProblemStats = async (problemId) => {
        try {
            const mockStats = {
                acceptanceRate: Math.floor(Math.random() * 50) + 30,
                totalSubmissions: Math.floor(Math.random() * 10000) + 1000,
                totalAccepted: Math.floor(Math.random() * 5000) + 500
            };
            setProblemStats(mockStats);
        } catch (error) {
            console.error('Failed to fetch problem stats:', error);
        }
    };

    // Setup auto-save when code changes
    useEffect(() => {
        if (currentUser && problemData && code.trim()) {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
            
            autoSaveIntervalRef.current = setInterval(() => {
                performAutoSave();
            }, 60000);
        }
        
        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [code, language, currentUser, problemData]);

    // Fetch supported languages
    const fetchSupportedLanguages = async () => {
        try {
            const response = await compilerAPI.getSupportedLanguages();
            if (response.success && response.data.languages) {
                setSupportedLanguages(response.data.languages);
            }
        } catch (error) {
            console.error('Failed to fetch supported languages:', error);
        }
    };

    // Check for restore options
    const checkForRestoreOptions = async (userId) => {
        try {
            const response = await autoSaveAPI.getRestoreOptions(
                userId, 
                problem._id || problem.problemId,
                problem.contestId
            );
            
            if (response.success && response.data) {
                const options = response.data;
                if (options.hasAutoSave || options.hasLatestSubmission) {
                    setRestoreOptions(options);
                    setShowRestoreModal(true);
                } else {
                    setCode(languageTemplates[language] || '');
                }
            }
        } catch (error) {
            console.error('Failed to check restore options:', error);
            setCode(languageTemplates[language] || '');
        }
    };

    // Perform auto-save
    const performAutoSave = useCallback(async () => {
        if (!currentUser || !problemData || !code.trim()) return;

        try {
            setAutoSaveStatus('Saving...');
            
            const autoSaveData = {
                userId: currentUser._id,
                problemId: problemData._id,
                contestId: problem.contestId || null,
                code: code,
                language: language,
                metadata: {
                    cursorPosition: { line: 0, column: 0 },
                    scrollPosition: 0,
                    fontSize: fontSize
                }
            };

            const response = await autoSaveAPI.saveCode(autoSaveData);
            
            if (response.success) {
                setLastSaved(new Date());
                setAutoSaveStatus('Saved');
                setTimeout(() => setAutoSaveStatus(''), 2000);
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
            setAutoSaveStatus('Failed to save');
            setTimeout(() => setAutoSaveStatus(''), 3000);
        }
    }, [currentUser, problemData, code, language, fontSize]);

    // Handle restore option selection
    const handleRestore = async (option) => {
        try {
            if (option === 'auto_save') {
                const response = await autoSaveAPI.loadCode(
                    currentUser._id,
                    problemData._id,
                    problem.contestId
                );
                if (response.success) {
                    setCode(response.data.code);
                    setLanguage(response.data.language);
                    if (response.data.metadata) {
                        setFontSize(response.data.metadata.fontSize || 14);
                    }
                }
            } else if (option === 'latest_submission') {
                const response = await autoSaveAPI.loadLatestSubmission(
                    currentUser._id,
                    problemData._id,
                    problem.contestId
                );
                if (response.success) {
                    setCode(response.data.code);
                    setLanguage(response.data.language);
                }
            } else {
                setCode(languageTemplates[language] || '');
            }
        } catch (error) {
            console.error('Failed to restore code:', error);
            setCode(languageTemplates[language] || '');
        } finally {
            setShowRestoreModal(false);
        }
    };

    // Handle language change
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        if (!code.trim() || code === languageTemplates[language]) {
            setCode(languageTemplates[newLanguage] || '');
        }
    };

    // Handle tab key press in textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            
            // Insert 4 spaces instead of tab
            const newValue = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newValue);
            
            // Move cursor to correct position
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    // Compile and run code
    const handleCompileAndRun = async () => {
        if (!code.trim()) {
            setOutput('Error: Please enter some code first');
            return;
        }

        setIsCompiling(true);
        setOutput('Running...');

        try {
            const response = await compilerAPI.compileCode({
                code: code,
                lang: language,
                input: input
            });

            if (response.success) {
                setOutput(response.output || 'No output');
            } else {
                setOutput(`Error: ${response.error || 'Compilation failed'}\n\n${response.stderr || ''}`);
            }
        } catch (error) {
            console.error('Compilation error:', error);
            setOutput(`Error: ${error.message || 'Failed to compile code'}`);
        } finally {
            setIsCompiling(false);
        }
    };

    // Test against sample test cases from database
    const handleTestCode = async () => {
        if (!code.trim()) {
            alert('Please enter some code first');
            return;
        }

        if (!problemData.testCases || problemData.testCases.length === 0) {
            alert('No test cases available for this problem');
            return;
        }

        setIsTesting(true);
        setTestResults(null);

        try {
            const results = [];
            
            // Test against first 3 test cases
            for (let i = 0; i < Math.min(3, problemData.testCases.length); i++) {
                const testCase = problemData.testCases[i];
                
                const response = await compilerAPI.compileCode({
                    code: code,
                    lang: language,
                    input: testCase.input
                });

                if (response.success) {
                    const actualOutput = response.output?.trim();
                    const expectedOutput = testCase.output?.trim();
                    const passed = actualOutput === expectedOutput;
                    
                    results.push({
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: expectedOutput,
                        actualOutput: actualOutput,
                        passed: passed,
                        error: null,
                        runtime: Math.floor(Math.random() * 100) + 'ms',
                        memory: Math.floor(Math.random() * 50) + 10 + 'MB'
                    });
                } else {
                    results.push({
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: testCase.output,
                        actualOutput: '',
                        passed: false,
                        error: response.error || 'Compilation failed',
                        runtime: 'N/A',
                        memory: 'N/A'
                    });
                }
            }

            setTestResults(results);
            setActiveTab('testcase');
        } catch (error) {
            console.error('Testing error:', error);
            alert(`Testing failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsTesting(false);
        }
    };

    // Submit code with confirmation
    const handleSubmitClick = () => {
        if (!code.trim()) {
            alert('Please enter some code first');
            return;
        }

        if (!problemData) {
            alert('No problem selected for submission');
            return;
        }

        setShowSubmissionConfirm(true);
    };

    const handleConfirmSubmission = async () => {
        setShowSubmissionConfirm(false);
        setIsSubmitting(true);

        try {
            const submissionData = {
                userId: currentUser._id,
                problemId: problemData._id,
                contestId: problem.contestId || null,
                code: code,
                language: language
            };

            const response = await submissionsAPI.submitCode(submissionData);
            
            if (response.success) {
                setSubmissionResult({
                    submissionId: response.submissionId,
                    status: response.status,
                    totalTestCases: response.totalTestCases,
                    message: response.message,
                    runtime: Math.floor(Math.random() * 100) + 'ms',
                    memory: Math.floor(Math.random() * 50) + 10 + 'MB'
                });
                setShowSubmissionModal(true);
                
                try {
                    await autoSaveAPI.clearAutoSave(
                        currentUser._id,
                        problemData._id,
                        problem.contestId
                    );
                } catch (clearError) {
                    console.error('Failed to clear auto-save:', clearError);
                }
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Submission failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Manual save
    const handleManualSave = async () => {
        await performAutoSave();
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-500';
            case 'Medium': return 'text-yellow-500';
            case 'Hard': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    if (loading || !problemData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (!problemData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="text-center">
                    <HiCode className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">No Problem Selected</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Please select a problem to start coding.</p>
                    <button 
                        onClick={() => navigate('/client/practice')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Browse Problems
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <HiArrowLeft className="text-xl" />
                            <span className="font-medium">Back</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <div>
                            <h1 className="text-lg font-semibold">{problemData.title}</h1>
                            <div className="flex items-center space-x-2 text-sm">
                                <span className={`font-medium ${getDifficultyColor(problemData.difficulty)}`}>
                                    {problemData.difficulty}
                                </span>
                                {isContestMode && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-blue-500">Contest Mode</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Auto-save status */}
                        {autoSaveStatus && (
                            <div className="flex items-center space-x-1 text-sm">
                                <div className={`w-2 h-2 rounded-full ${
                                    autoSaveStatus === 'Saved' ? 'bg-green-500' : 
                                    autoSaveStatus === 'Saving...' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                                }`}></div>
                                <span className="text-gray-600 dark:text-gray-400">{autoSaveStatus}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-73px)]">
                {/* Left Panel - Problem Description */}
                <div className="w-1/2 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Tabs - Only Description and Testcase */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'description'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Description
                        </button>
                        {testResults && (
                            <button
                                onClick={() => setActiveTab('testcase')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'testcase'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                Testcase
                                {testResults && (
                                    <span className={`ml-2 w-2 h-2 rounded-full inline-block ${
                                        testResults.every(r => r.passed) ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'description' && (
                            <div className="space-y-6">
                                {/* Problem Title and Stats - Removed Likes/Dislikes */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold">{problemData.title}</h2>
                                    </div>
                                    
                                    
                                </div>

                                {/* Problem Description */}
                                <div className="prose dark:prose-invert max-w-none">
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {problemData.description}
                                    </div>
                                </div>

                                {/* Examples from Database Test Cases */}
                                {problemData.testCases && problemData.testCases.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Examples</h3>
                                        {problemData.testCases.slice(0, 2).map((testCase, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                                    Example {index + 1}:
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input: </span>
                                                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                                                            {testCase.input}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output: </span>
                                                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                                                            {testCase.output}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}                                

                                {/* Related Topics from Database */}
                                {problemData.tags && problemData.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Related Topics</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {problemData.tags.map((topic, index) => (
                                                <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'testcase' && testResults && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Test Results</h3>
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="text-green-600">
                                            ✓ {testResults.filter(r => r.passed).length} Passed
                                        </span>
                                        <span className="text-red-600">
                                            ✗ {testResults.filter(r => !r.passed).length} Failed
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {testResults.map((result, index) => (
                                        <div key={index} className={`border rounded-lg p-4 ${
                                            result.passed 
                                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                                                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                        }`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-medium">
                                                    Test Case {result.testCase}
                                                </span>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                                                        {result.passed ? 'PASSED' : 'FAILED'}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {result.runtime}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {result.memory}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                                                    <pre className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                                        {result.input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span>
                                                    <pre className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                                        {result.expectedOutput}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Your Output:</span>
                                                    <pre className={`mt-1 p-2 rounded text-xs overflow-x-auto ${
                                                        result.passed 
                                                            ? 'bg-green-100 dark:bg-green-800/20 text-green-800 dark:text-green-200'
                                                            : 'bg-red-100 dark:bg-red-800/20 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {result.actualOutput || 'No output'}
                                                    </pre>
                                                </div>
                                                {result.error && (
                                                    <div>
                                                        <span className="font-medium text-red-700 dark:text-red-300">Error:</span>
                                                        <pre className="mt-1 bg-red-100 dark:bg-red-800/20 p-2 rounded text-xs text-red-800 dark:text-red-200 overflow-x-auto">
                                                            {result.error}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="w-1/2 flex flex-col">
                    {/* Code Editor Header */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {supportedLanguages.map((lang) => (
                                        <option key={lang.key} value={lang.key}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                                
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                    <button
                                        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                                        className="hover:text-gray-900 dark:hover:text-white"
                                    >
                                        A-
                                    </button>
                                    <span>{fontSize}px</span>
                                    <button
                                        onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                                        className="hover:text-gray-900 dark:hover:text-white"
                                    >
                                        A+
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleManualSave}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <HiSave className="text-lg" />
                                    <span>Save</span>
                                </button>
                                
                                <button
                                    onClick={() => setCode(languageTemplates[language] || '')}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <HiRefresh className="text-lg" />
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
                        <textarea
                            ref={codeEditorRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 font-mono resize-none focus:outline-none border-none"
                            placeholder="Write your code here..."
                            spellCheck="false"
                            style={{ 
                                fontSize: `${fontSize}px`, 
                                lineHeight: '1.5',
                                tabSize: 4
                            }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${
                        consoleCollapsed ? 'h-16' : 'h-80'
                    } transition-all duration-300`}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium">Console</span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleCompileAndRun}
                                        disabled={isCompiling}
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <HiPlay className="text-sm" />
                                        <span>{isCompiling ? 'Running...' : 'Run'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleTestCode}
                                        disabled={isTesting}
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <HiBeaker className="text-sm" />
                                        <span>{isTesting ? 'Testing...' : 'Test'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleSubmitClick}
                                        disabled={isSubmitting}
                                        className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <HiUpload className="text-sm" />
                                        <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setConsoleCollapsed(!consoleCollapsed)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                {consoleCollapsed ? <HiChevronUp /> : <HiChevronDown />}
                            </button>
                        </div>
                        
                        {!consoleCollapsed && (
                            <div className="flex h-60">
                                {/* Input */}
                                <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-sm font-medium">
                                        Input
                                    </div>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full h-52 p-4 text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                                        placeholder="Enter input here..."
                                        style={{ tabSize: 4 }}
                                    />
                                </div>
                                
                                {/* Output */}
                                <div className="w-1/2">
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-sm font-medium">
                                        Output
                                    </div>
                                    <div className="h-52 p-4 overflow-y-auto bg-white dark:bg-gray-800">
                                        <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                                            {output || 'Run your code to see output...'}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* All existing modals remain the same... */}
            {/* Submission Confirmation Modal */}
            {showSubmissionConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <HiUpload className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Submit Solution</h3>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to submit your solution for "{problemData.title}"? 
                            This will be evaluated against all test cases.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSubmissionConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmission}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Result Modal */}
            {showSubmissionModal && submissionResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiCheck className="text-2xl text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Submission Received!</h3>
                            <p className="text-gray-600 dark:text-gray-400">{submissionResult.message}</p>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Submission ID</div>
                                <div className="font-mono text-sm">{submissionResult.submissionId}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                                    <div className="font-medium capitalize">{submissionResult.status}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Test Cases</div>
                                    <div className="font-medium">{submissionResult.totalTestCases}</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Runtime</div>
                                    <div className="font-medium">{submissionResult.runtime}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
                                    <div className="font-medium">{submissionResult.memory}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSubmissionModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Continue Coding
                            </button>
                            <button
                                onClick={() => navigate('/client/submissions')}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                View Submissions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Options Modal */}
            {showRestoreModal && restoreOptions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Restore Previous Work?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We found some previous work for this problem. What would you like to do?
                        </p>
                        
                        <div className="space-y-3">
                            {restoreOptions.recommendations.map((rec, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRestore(rec.type)}
                                    className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <div className="font-medium mb-1">
                                        {rec.type === 'auto_save' ? 'Continue from Auto-save' :
                                         rec.type === 'latest_submission' ? 'Load Latest Submission' :
                                         'Start Fresh'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {rec.message}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compiler;
