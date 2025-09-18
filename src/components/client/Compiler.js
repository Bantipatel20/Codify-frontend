// src/components/client/Compiler.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlay, HiSave, HiUpload } from 'react-icons/hi';
import { compilerAPI, submissionsAPI, autoSaveAPI, authAPI } from '../../services/api';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supportedLanguages, setSupportedLanguages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreOptions, setRestoreOptions] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);

    // Language templates
    const languageTemplates = {
        python: `# Python code
def solve():
    # Your solution here
    pass

if __name__ == "__main__":
    solve()`,
        javascript: `// JavaScript code
function solve() {
    // Your solution here
}

solve();`,
        java: `// Java code
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
        sc.close();
    }
}`,
        cpp: `// C++ code
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Your solution here
    return 0;
}`,
        c: `// C code
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your solution here
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
            checkForRestoreOptions(user._id);
        }
        
        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [problem, navigate]);

    // Setup auto-save when code changes
    useEffect(() => {
        if (currentUser && problem && code.trim()) {
            // Clear existing interval
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
            
            // Set up new auto-save interval (every 1 minute)
            autoSaveIntervalRef.current = setInterval(() => {
                performAutoSave();
            }, 60000); // 1 minute
        }
        
        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [code, language, currentUser, problem]);

    // Fetch supported languages
    const fetchSupportedLanguages = async () => {
        try {
            const response = await compilerAPI.getSupportedLanguages();
            if (response.success) {
                setSupportedLanguages(response.data.languages || []);
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
                problem.problemId || problem._id,
                problem.contestId
            );
            
            if (response.success && response.data) {
                const options = response.data;
                if (options.hasAutoSave || options.hasLatestSubmission) {
                    setRestoreOptions(options);
                    setShowRestoreModal(true);
                } else {
                    // No restore options, set default template
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
        if (!currentUser || !problem || !code.trim()) return;

        try {
            setAutoSaveStatus('Saving...');
            
            const autoSaveData = {
                userId: currentUser._id,
                problemId: problem.problemId || problem._id,
                contestId: problem.contestId || null,
                code: code,
                language: language,
                metadata: {
                    cursorPosition: { line: 0, column: 0 },
                    scrollPosition: 0,
                    theme: 'dark'
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
    }, [currentUser, problem, code, language]);

    // Handle restore option selection
    const handleRestore = async (option) => {
        try {
            if (option === 'auto_save') {
                const response = await autoSaveAPI.loadCode(
                    currentUser._id,
                    problem.problemId || problem._id,
                    problem.contestId
                );
                if (response.success) {
                    setCode(response.data.code);
                    setLanguage(response.data.language);
                }
            } else if (option === 'latest_submission') {
                const response = await autoSaveAPI.loadLatestSubmission(
                    currentUser._id,
                    problem.problemId || problem._id,
                    problem.contestId
                );
                if (response.success) {
                    setCode(response.data.code);
                    setLanguage(response.data.language);
                }
            } else {
                // Fresh start
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

    // Compile and run code
    const handleCompileAndRun = async () => {
        if (!code.trim()) {
            alert('Please enter some code first');
            return;
        }

        setIsCompiling(true);
        setOutput('');

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

    // Submit code for evaluation
    const handleSubmit = async () => {
        if (!code.trim()) {
            alert('Please enter some code first');
            return;
        }

        if (!problem) {
            alert('No problem selected for submission');
            return;
        }

        setIsSubmitting(true);

        try {
            const submissionData = {
                userId: currentUser._id,
                problemId: problem.problemId || problem._id,
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
                    message: response.message
                });
                setShowSubmissionModal(true);
                
                // Clear auto-save after successful submission
                try {
                    await autoSaveAPI.clearAutoSave(
                        currentUser._id,
                        problem.problemId || problem._id,
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

    if (!problem) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Problem Selected</h2>
                    <p className="text-gray-400 mb-6">Please select a problem to start coding.</p>
                    <button 
                        onClick={() => navigate('/client/practice')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                    >
                        Go to Practice Problems
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <HiArrowLeft className="text-xl" />
                            <span>Back</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">{problem.title}</h1>
                            <p className="text-sm text-gray-400">
                                {isContestMode ? 'Contest Mode' : 'Practice Mode'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* Auto-save status */}
                        <div className="flex items-center space-x-2 text-sm">
                            {autoSaveStatus && (
                                <span className={`${
                                    autoSaveStatus === 'Saved' ? 'text-green-400' : 
                                    autoSaveStatus === 'Saving...' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                    {autoSaveStatus}
                                </span>
                            )}
                            {lastSaved && (
                                <span className="text-gray-400">
                                    Last saved: {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        
                        {/* Action buttons */}
                        <button
                            onClick={handleManualSave}
                            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <HiSave className="text-lg" />
                            <span>Save</span>
                        </button>
                        
                        <button
                            onClick={handleCompileAndRun}
                            disabled={isCompiling}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <HiPlay className="text-lg" />
                            <span>{isCompiling ? 'Running...' : 'Run'}</span>
                        </button>
                        
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <HiUpload className="text-lg" />
                            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-screen">
                {/* Problem Description */}
                <div className="w-1/2 bg-gray-800 p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                        <div className="flex items-center space-x-4 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                                {problem.difficulty}
                            </span>
                            {problem.points && (
                                <span className="text-yellow-400">
                                    {problem.points} points
                                </span>
                            )}
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 whitespace-pre-wrap">
                                {problem.description || problem.manualProblem?.description}
                            </p>
                        </div>
                        
                        {/* Sample Input/Output */}
                        {problem.manualProblem?.sampleInput && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Sample Input:</h3>
                                <pre className="bg-gray-900 p-3 rounded-lg text-sm">
                                    {problem.manualProblem.sampleInput}
                                </pre>
                            </div>
                        )}
                        
                        {problem.manualProblem?.sampleOutput && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Sample Output:</h3>
                                <pre className="bg-gray-900 p-3 rounded-lg text-sm">
                                    {problem.manualProblem.sampleOutput}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Editor and Output */}
                <div className="w-1/2 flex flex-col">
                    {/* Language Selector */}
                    <div className="bg-gray-800 p-4 border-b border-gray-700">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {supportedLanguages.map((lang) => (
                                <option key={lang.key} value={lang.key}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 bg-gray-900">
                        <textarea
                            ref={codeEditorRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none"
                            placeholder="Write your code here..."
                            spellCheck="false"
                        />
                    </div>

                    {/* Input/Output Section */}
                    <div className="h-1/3 bg-gray-800 border-t border-gray-700">
                        <div className="flex h-full">
                            {/* Input */}
                            <div className="w-1/2 border-r border-gray-700">
                                <div className="bg-gray-700 px-4 py-2 text-sm font-medium">
                                    Input
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full h-full bg-gray-800 text-white p-4 text-sm resize-none focus:outline-none"
                                    placeholder="Enter input here..."
                                />
                            </div>
                            
                            {/* Output */}
                            <div className="w-1/2">
                                <div className="bg-gray-700 px-4 py-2 text-sm font-medium">
                                    Output
                                </div>
                                <div className="h-full bg-gray-800 p-4 overflow-y-auto">
                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                                        {output || 'Run your code to see output...'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restore Options Modal */}
            {showRestoreModal && restoreOptions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Restore Previous Work?</h3>
                        <p className="text-gray-300 mb-6">
                            We found some previous work for this problem. What would you like to do?
                        </p>
                        
                        <div className="space-y-3">
                            {restoreOptions.recommendations.map((rec, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRestore(rec.type)}
                                    className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <div className="font-medium text-white mb-1">
                                        {rec.type === 'auto_save' ? 'Continue from Auto-save' :
                                         rec.type === 'latest_submission' ? 'Load Latest Submission' :
                                         'Start Fresh'}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {rec.message}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Result Modal */}
            {showSubmissionModal && submissionResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Submission Received!</h3>
                        <div className="space-y-3 mb-6">
                            <p className="text-gray-300">{submissionResult.message}</p>
                            <div className="bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm text-gray-400">Submission ID:</div>
                                <div className="font-mono text-sm">{submissionResult.submissionId}</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm text-gray-400">Status:</div>
                                <div className="font-medium capitalize">{submissionResult.status}</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm text-gray-400">Test Cases:</div>
                                <div>{submissionResult.totalTestCases} test cases to evaluate</div>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSubmissionModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                            >
                                Continue Coding
                            </button>
                            <button
                                onClick={() => navigate('/client/submissions')}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                            >
                                View Submissions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compiler;
