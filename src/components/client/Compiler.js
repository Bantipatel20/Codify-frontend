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
    HiCheck,
    HiExclamation,
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
    
    // Updated test results state
    const [sampleTestResults, setSampleTestResults] = useState(null);
    const [allTestResults, setAllTestResults] = useState(null);
    
    // UI State
    const [activeTab, setActiveTab] = useState('description');
    const [consoleCollapsed, setConsoleCollapsed] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [problemData, setProblemData] = useState(null);
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
        
        // Initialize problem data based on context (contest vs practice)
        const initializeProblemData = async () => {
            try {
                setLoading(true);
                console.log('🔄 Initializing problem data...', { problem, isContestMode });

                let resolvedProblemData = null;

                if (isContestMode) {
                    // For contest mode, use the problem data as-is from contest
                    console.log('📝 Contest mode: Using contest problem data');
                    resolvedProblemData = {
                        _id: problem.problemId || problem._id,
                        title: problem.title,
                        description: problem.description || problem.manualProblem?.description || 'No description available for this contest problem.',
                        difficulty: problem.difficulty || 'Medium',
                        tags: problem.tags || [],
                        // Separate normal and hidden test cases
                        testCases: problem.testCases?.filter(tc => tc.type !== 'hidden') || [],
                        hiddenTestCases: problem.testCases?.filter(tc => tc.type === 'hidden') || problem.hiddenTestCases || [],
                        sampleInput: problem.manualProblem?.sampleInput || '',
                        sampleOutput: problem.manualProblem?.sampleOutput || '',
                        points: problem.points || 100,
                        contestId: problem.contestId
                    };

                    // Create sample test cases from manual problem data if available
                    if (problem.manualProblem?.sampleInput && problem.manualProblem?.sampleOutput) {
                        resolvedProblemData.testCases = [
                            {
                                input: problem.manualProblem.sampleInput,
                                output: problem.manualProblem.sampleOutput,
                                type: 'sample'
                            }
                        ];
                    }
                } else {
                    // For practice mode, fetch from database
                    console.log('🎯 Practice mode: Fetching from database');
                    const response = await problemsAPI.getProblemById(problem._id || problem.problemId, false);
                    
                    console.log('📊 Full problem response:', response);
                    
                    if (response.success && response.data) {
                        const data = response.data;
                        
                        // Handle different test case structures from backend
                        let normalTests = [];
                        let hiddenTests = [];
                        
                        // Check for publicTestCases and hiddenTestCases arrays (split format)
                        if (data.publicTestCases || data.hiddenTestCases) {
                            console.log('📝 Using split test case format');
                            normalTests = data.publicTestCases || [];
                            hiddenTests = data.hiddenTestCases || [];
                        } 
                        // Check for unified testCases array with type markers
                        else if (data.testCases && Array.isArray(data.testCases)) {
                            console.log('📝 Using unified test case format');
                            normalTests = data.testCases.filter(tc => !tc.isHidden || tc.isPublic) || [];
                            hiddenTests = data.testCases.filter(tc => tc.isHidden) || [];
                        }
                        
                        resolvedProblemData = {
                            ...data,
                            testCases: normalTests.map(tc => ({
                                ...tc,
                                type: 'sample'
                            })),
                            hiddenTestCases: hiddenTests.map(tc => ({
                                ...tc,
                                type: 'hidden'
                            }))
                        };
                    } else {
                        console.warn('Failed to fetch problem from database, using fallback data');
                        resolvedProblemData = {
                            ...problem,
                            testCases: problem.testCases?.filter(tc => tc.type !== 'hidden') || problem.publicTestCases || [],
                            hiddenTestCases: problem.testCases?.filter(tc => tc.type === 'hidden') || problem.hiddenTestCases || []
                        };
                    }
                }

                console.log('✅ Problem data resolved:', {
                    ...resolvedProblemData,
                    normalTestCases: resolvedProblemData.testCases?.length || 0,
                    hiddenTestCases: resolvedProblemData.hiddenTestCases?.length || 0
                });
                setProblemData(resolvedProblemData);
                
                // Fetch statistics
                await fetchProblemStats(resolvedProblemData._id);
                
                // Check for restore options
                if (user) {
                    await checkForRestoreOptions(user._id, resolvedProblemData);
                }
                
            } catch (error) {
                console.error('❌ Error initializing problem data:', error);
                // Fallback to using passed problem data
                setProblemData({
                    ...problem,
                    testCases: problem.testCases?.filter(tc => tc.type !== 'hidden') || [],
                    hiddenTestCases: problem.testCases?.filter(tc => tc.type === 'hidden') || []
                });
            } finally {
                setLoading(false);
            }
        };
        
        if (problem) {
            initializeProblemData();
        }
        
        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problem, navigate]);

    // Fetch problem statistics
    const fetchProblemStats = async (problemId) => {
        try {
            // Mock stats - not currently displayed in UI
            console.log('Fetched stats for problem:', problemId);
        } catch (error) {
            console.error('Failed to fetch problem stats:', error);
        }
    };

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

    // Perform auto-save
    const performAutoSave = useCallback(async () => {
        if (!currentUser || !problemData || !code.trim()) return;

        try {
            setAutoSaveStatus('Saving...');
            console.log('💾 Performing auto-save...', {
                userId: currentUser._id,
                problemId: problemData._id,
                contestId: problemData.contestId
            });
            
            const autoSaveData = {
                userId: currentUser._id,
                problemId: problemData._id,
                contestId: problemData.contestId || null,
                code: code,
                language: language,
                metadata: {
                    cursorPosition: { line: 0, column: 0 },
                    scrollPosition: 0,
                    fontSize: fontSize,
                    isContestMode: isContestMode
                }
            };

            const response = await autoSaveAPI.saveCode(autoSaveData);
            
            if (response.success) {
                setLastSaved(new Date());
                setAutoSaveStatus('Saved');
                console.log('✅ Auto-save successful');
                setTimeout(() => setAutoSaveStatus(''), 2000);
            } else {
                throw new Error(response.error || 'Auto-save failed');
            }
        } catch (error) {
            console.error('❌ Auto-save failed:', error);
            setAutoSaveStatus('Save failed');
            setTimeout(() => setAutoSaveStatus(''), 3000);
        }
    }, [currentUser, problemData, code, language, fontSize, isContestMode]);

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
    }, [code, language, currentUser, problemData, performAutoSave]);

    // Check for restore options
    const checkForRestoreOptions = async (userId, problemData) => {
        try {
            console.log('🔍 Checking restore options for:', { userId, problemId: problemData._id, contestId: problemData.contestId });
            
            const response = await autoSaveAPI.getRestoreOptions(
                userId, 
                problemData._id,
                problemData.contestId || null
            );
            
            if (response.success && response.data) {
                const options = response.data;
                console.log('📋 Restore options found:', options);
                
                if (options.hasAutoSave || options.hasLatestSubmission) {
                    setRestoreOptions(options);
                    setShowRestoreModal(true);
                } else {
                    console.log('🆕 No previous work found, starting fresh');
                    setCode(languageTemplates[language] || '');
                }
            } else {
                console.log('🆕 No restore options available, starting fresh');
                setCode(languageTemplates[language] || '');
            }
        } catch (error) {
            console.error('❌ Failed to check restore options:', error);
            setCode(languageTemplates[language] || '');
        }
    };

    // Handle restore option selection
    const handleRestore = async (option) => {
        try {
            console.log('🔄 Restoring option:', option);
            
            if (option === 'auto_save') {
                const response = await autoSaveAPI.loadCode(
                    currentUser._id,
                    problemData._id,
                    problemData.contestId || null
                );
                if (response.success) {
                    setCode(response.data.code);
                    setLanguage(response.data.language);
                    if (response.data.metadata) {
                        setFontSize(response.data.metadata.fontSize || 14);
                    }
                    console.log('✅ Auto-save restored');
                }
            } else if (option === 'latest_submission') {
                const response = await autoSaveAPI.loadLatestSubmission(
                    currentUser._id,
                    problemData._id,
                    problemData.contestId || null
                );
                if (response.success) {
                    setCode(response.data.code);
                    setLanguage(response.data.language);
                    console.log('✅ Latest submission restored');
                }
            } else {
                setCode(languageTemplates[language] || '');
                console.log('🆕 Started fresh');
            }
        } catch (error) {
            console.error('❌ Failed to restore code:', error);
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


    const convertInputFormat = (input) => {
        if (!input) return '';
        
        // Split by lines
        const lines = input.split('\n');
        const convertedLines = lines.map(line => {
            // Remove leading/trailing whitespace
            const trimmed = line.trim();
            
            // Check if line contains variable assignment pattern (e.g., "a = 11" or "x=5")
            const assignmentMatch = trimmed.match(/^[a-zA-Z_]\w*\s*=\s*(.+)$/);
            
            if (assignmentMatch) {
                // Extract value after '='
                return assignmentMatch[1].trim();
            }
            
            // Return line as-is if no assignment pattern
            return trimmed;
        });
        
        return convertedLines.join('\n');
    };

    // Test against sample test cases only
    const handleTestCode = async () => {
        if (!code.trim()) {
            alert('Please enter some code first');
            return;
        }

        // Get only normal/sample test cases (not hidden ones)
        let testCasesToRun = [];
        
        if (problemData.testCases && problemData.testCases.length > 0) {
            // Use first 3 normal test cases
            testCasesToRun = problemData.testCases.slice(0, 3);
        } else if (problemData.sampleInput && problemData.sampleOutput) {
            // Fallback to sample input/output
            testCasesToRun = [{
                input: problemData.sampleInput,
                output: problemData.sampleOutput,
                type: 'sample'
            }];
        } else {
            alert('No sample test cases available for testing');
            return;
        }

        console.log('🧪 Running sample test cases:', testCasesToRun.length);
        await runTestCases(testCasesToRun, 'sample');
    };

    // Run test cases with mode specification
    const runTestCases = async (testCases, mode = 'sample') => {
        const isSampleMode = mode === 'sample';
        
        if (isSampleMode) {
            setIsTesting(true);
            setSampleTestResults(null);
        } else {
            // Don't set isSubmitting here, let the caller handle it
            setAllTestResults(null);
        }

        try {
            const results = [];
            const maxTests = isSampleMode ? Math.min(3, testCases.length) : testCases.length;
            
            console.log(`🔄 Running ${maxTests} ${mode} test cases...`);
            console.log('📋 Test cases to process:', testCases);
            
            // Process each test case sequentially
            for (let i = 0; i < maxTests; i++) {
                const testCase = testCases[i];
                const testNumber = i + 1;
                
                console.log(`\n🧪 Test Case #${testNumber}:`, {
                    type: testCase.type || testCase.isHidden ? 'hidden' : 'visible',
                    originalInput: testCase.input,
                    expectedOutput: testCase.output
                });
                
                // Convert input format (e.g., "a = 11" → "11")
                const convertedInput = convertInputFormat(testCase.input || '');
                console.log(`📝 Converted input:`, convertedInput);
                
                try {
                    // Send request to /compile API
                    const startTime = Date.now();
                    const response = await compilerAPI.compileCode({
                        code: code,
                        lang: language,
                        input: convertedInput
                    });
                    const executionTime = Date.now() - startTime;

                    console.log(`✅ Test ${testNumber} response:`, {
                        success: response.success,
                        stdout: response.output,
                        stderr: response.stderr,
                        executionTime: `${executionTime}ms`
                    });

                    // Check if execution was successful
                    if (response.success || response.output) {
                        const actualOutput = (response.output || '').trim();
                        // Use expectedOutput if available, otherwise fall back to convertedInput for simple I/O problems
                        let expectedOutput = (testCase.output || testCase.expectedOutput || '').trim();
                        
                        // If no expected output provided, use converted input as fallback (for simple echo problems)
                        if (!expectedOutput && convertedInput) {
                            expectedOutput = convertedInput.trim();
                            console.warn(`⚠️ No expected output for test ${testNumber}, using converted input as fallback: "${expectedOutput}"`);
                        }
                        
                        const passed = actualOutput === expectedOutput;
                        
                        results.push({
                            testCase: testNumber,
                            input: testCase.input,
                            convertedInput: convertedInput,
                            expectedOutput: expectedOutput,
                            actualOutput: actualOutput,
                            passed: passed,
                            // Only store error if test failed, ignore stderr warnings for passed tests
                            error: passed ? null : (response.stderr || null),
                            runtime: response.executionTime || `${executionTime}ms`,
                            memory: Math.floor(Math.random() * 50) + 10 + 'MB', // Mock memory
                            type: testCase.type || (testCase.isHidden ? 'hidden' : 'visible'),
                            isHidden: testCase.isHidden || testCase.type === 'hidden'
                        });

                        console.log(`${passed ? '✅ PASS' : '❌ FAIL'} Test ${testNumber}:`, {
                            expected: expectedOutput,
                            actual: actualOutput,
                            match: passed
                        });
                    } else {
                        // Compilation or runtime error
                        results.push({
                            testCase: testNumber,
                            input: testCase.input,
                            convertedInput: convertedInput,
                            expectedOutput: testCase.output,
                            actualOutput: '',
                            passed: false,
                            error: response.stderr || response.error || 'Compilation/Runtime error',
                            runtime: 'N/A',
                            memory: 'N/A',
                            type: testCase.type || (testCase.isHidden ? 'hidden' : 'visible'),
                            isHidden: testCase.isHidden || testCase.type === 'hidden'
                        });

                        console.log(`❌ FAIL Test ${testNumber}: Compilation/Runtime error`);
                    }
                } catch (apiError) {
                    console.error(`❌ API Error for test ${testNumber}:`, apiError);
                    
                    // Extract error message from various possible formats
                    let errorMessage = 'Unknown error';
                    if (apiError.error) {
                        errorMessage = apiError.error;
                    } else if (apiError.stderr) {
                        errorMessage = apiError.stderr;
                    } else if (apiError.message) {
                        errorMessage = apiError.message;
                    } else if (apiError.response?.data?.error) {
                        errorMessage = apiError.response.data.error;
                    }
                    
                    results.push({
                        testCase: testNumber,
                        input: testCase.input,
                        convertedInput: convertedInput,
                        expectedOutput: testCase.output,
                        actualOutput: '',
                        passed: false,
                        error: errorMessage,
                        runtime: 'N/A',
                        memory: 'N/A',
                        type: testCase.type || (testCase.isHidden ? 'hidden' : 'visible'),
                        isHidden: testCase.isHidden || testCase.type === 'hidden'
                    });
                }
            }

            // Store results based on mode
            if (isSampleMode) {
                setSampleTestResults(results);
                setActiveTab('testcase');
            } else {
                setAllTestResults(results);
            }
            
            const passedCount = results.filter(r => r.passed).length;
            const timeoutCount = results.filter(r => r.error && r.error.includes('timed out')).length;
            
            console.log(`\n✅ ${mode} test cases completed:`, {
                total: results.length,
                passed: passedCount,
                failed: results.length - passedCount,
                timedOut: timeoutCount,
                results: results
            });
            
            // Show alert if any test cases timed out
            if (timeoutCount > 0) {
                alert(`⚠️ Warning: ${timeoutCount} test case(s) timed out after 30 seconds.\n\nThis usually means:\n• Your code has an infinite loop\n• Your algorithm is too slow (O(n²) or worse)\n• Input is too large for your solution\n\nPlease optimize your code and try again.`);
            }
            
            // Return results for submission mode
            console.log(`📦 Returning ${results.length} test results for ${mode} mode`);
            return results;
            
        } catch (error) {
            console.error(`❌ ${mode} testing error:`, error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            alert(`Testing failed: ${error.message || 'Unknown error'}`);
            return [];
        } finally {
            if (isSampleMode) {
                setIsTesting(false);
            }
            // Don't set isSubmitting to false here for 'all' mode
            // Let handleConfirmSubmission handle it after showing the modal
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

    // Handle confirmed submission with all test cases
    const handleConfirmSubmission = async () => {
        setShowSubmissionConfirm(false);
        setIsSubmitting(true);

        try {
            // First, run all test cases (normal + hidden) for evaluation
            const allTestCases = [
                ...(problemData.testCases || []),
                ...(problemData.hiddenTestCases || [])
            ];

            console.log('📤 Running full evaluation with all test cases:', {
                normal: problemData.testCases?.length || 0,
                hidden: problemData.hiddenTestCases?.length || 0,
                total: allTestCases.length
            });

            let testResults = [];
            if (allTestCases.length > 0) {
                // Wait for all test cases to complete and get results directly
                testResults = await runTestCases(allTestCases, 'all');
                console.log('✅ Received test results from runTestCases:', testResults);
                
                // If no results returned, something went wrong
                if (!testResults || testResults.length === 0) {
                    console.error('❌ No test results returned from runTestCases!');
                    alert('Failed to execute test cases. Please try again.');
                    return;
                }
            } else {
                console.error('❌ No test cases available for this problem!');
                alert('This problem has no test cases configured.');
                return;
            }

            // Calculate test results using the returned results (not state)
            const passedTests = testResults.filter(r => r.passed).length;
            const totalTests = testResults.length;
            const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
            
            console.log('📊 Final test results:', {
                passedTests,
                totalTests,
                score,
                testResults: testResults
            });
            
            // Determine status based on results
            let status = 'wrong_answer';
            if (passedTests === totalTests && totalTests > 0) {
                status = 'accepted';
            } else if (passedTests === 0 && totalTests > 0) {
                // Check if ALL tests had runtime errors (not just stderr warnings)
                const allHaveErrors = testResults.every(r => r.error && r.actualOutput === '');
                status = allHaveErrors ? 'runtime_error' : 'wrong_answer';
            } else if (passedTests > 0 && passedTests < totalTests) {
                // Some tests passed, some failed - it's a wrong answer
                status = 'wrong_answer';
            }

            console.log('🎯 Calculated status:', {
                passedTests,
                totalTests,
                status,
                testResults: testResults.map(r => ({
                    testCase: r.testCase,
                    passed: r.passed,
                    hasError: !!r.error,
                    hasOutput: !!r.actualOutput,
                    error: r.error
                }))
            });

            // Submit to backend with test results
            const submissionData = {
                userId: currentUser._id,
                problemId: problemData._id,
                contestId: problemData.contestId || null,
                code: code,
                language: language,
                status: status,
                score: score,
                passedTestCases: passedTests,
                totalTestCases: totalTests,
                testCaseResults: testResults
            };

            console.log('📤 Submitting code to backend with status:', status);
            console.log('📤 Full submission data:', JSON.stringify(submissionData, null, 2));

            const response = await submissionsAPI.submitCode(submissionData);
            
            if (response.success) {
                console.log('✅ Submission successful, showing modal...');
                
                setSubmissionResult({
                    submissionId: response.submissionId,
                    status: status, // Use the status we calculated, not backend status
                    totalTestCases: totalTests,
                    passedTestCases: passedTests,
                    message: response.message,
                    runtime: Math.floor(Math.random() * 100) + 'ms',
                    memory: Math.floor(Math.random() * 50) + 10 + 'MB',
                    score: isContestMode ? Math.floor((passedTests / totalTests) * (problemData.points || 100)) : null
                });
                
                // Only show modal after all test results are ready
                setShowSubmissionModal(true);
                
                // Clear auto-save after successful submission
                try {
                    await autoSaveAPI.clearAutoSave(
                        currentUser._id,
                        problemData._id,
                        problemData.contestId || null
                    );
                    console.log('🧹 Auto-save cleared after submission');
                } catch (clearError) {
                    // Silently ignore if no auto-save exists (404 error)
                    if (clearError.response?.status !== 404) {
                        console.error('Failed to clear auto-save:', clearError);
                    }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Loading problem...</p>
                    {isContestMode && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Contest Mode</p>
                    )}
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
                        onClick={() => navigate(isContestMode ? '/client/contests' : '/client/practice')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {isContestMode ? 'Browse Contests' : 'Browse Problems'}
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
                                        {problemData.points && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-yellow-500">{problemData.points} pts</span>
                                            </>
                                        )}
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
                        {lastSaved && (
                            <span className="text-xs text-gray-500">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-73px)]">
                {/* Left Panel - Problem Description */}
                <div className="w-1/2 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Tabs - Description and Test Results */}
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
                        {(sampleTestResults || allTestResults) && (
                            <button
                                onClick={() => setActiveTab('testcase')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'testcase'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {allTestResults ? 'Full Results' : 'Test Results'}
                                {(sampleTestResults || allTestResults) && (
                                    <span className={`ml-2 w-2 h-2 rounded-full inline-block ${
                                        (sampleTestResults || allTestResults).every(r => r.passed) ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'description' && (
                            <div className="space-y-6">
                                {/* Problem Title and Contest Info */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold">{problemData.title}</h2>
                                        {isContestMode && (
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                                                    Contest
                                                </span>
                                                {problemData.points && (
                                                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm">
                                                        {problemData.points} points
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Test Case Information removed per UX request */}

                                {/* Problem Description */}
                                <div className="prose dark:prose-invert max-w-none">
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {problemData.description}
                                    </div>
                                </div>

                                {/* Examples from Sample Input/Output or Test Cases */}
                                {(problemData.sampleInput && problemData.sampleOutput) || (problemData.testCases && problemData.testCases.length > 0) ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Examples</h3>
                                        
                                        {/* Show sample input/output if available */}
                                        {problemData.sampleInput && problemData.sampleOutput && (
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                                    Example 1:
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input: </span>
                                                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                                                            {problemData.sampleInput}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output: </span>
                                                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                                                            {problemData.sampleOutput || 'No output specified'}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Show test cases if available and no sample input/output */}
                                        {(!problemData.sampleInput || !problemData.sampleOutput) && problemData.testCases && problemData.testCases.slice(0, 2).map((testCase, index) => (
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
                                                            {testCase.output || testCase.expectedOutput || 'No output specified'}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex items-center space-x-2">
                                            <HiExclamation className="text-yellow-600 dark:text-yellow-400" />
                                            <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                                                No examples available for this problem. Use the Test button to validate your solution.
                                            </span>
                                        </div>
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

                        {activeTab === 'testcase' && (sampleTestResults || allTestResults) && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        {allTestResults ? 'Full Evaluation Results' : 'Sample Test Results'}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm">
                                        {allTestResults && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-blue-600">
                                                    📊 {allTestResults.filter(r => r.type !== 'hidden').length} Sample
                                                </span>
                                                <span className="text-purple-600">
                                                    🔒 {allTestResults.filter(r => r.type === 'hidden').length} Hidden
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-green-600">
                                            ✓ {(sampleTestResults || allTestResults).filter(r => r.passed).length} Passed
                                        </span>
                                        <span className="text-red-600">
                                            ✗ {(sampleTestResults || allTestResults).filter(r => !r.passed).length} Failed
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {(sampleTestResults || allTestResults).map((result, index) => (
                                        <div key={index} className={`border rounded-lg p-4 ${
                                            result.passed 
                                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                                                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                        }`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">
                                                        Test Case {result.testCase}
                                                    </span>
                                                    {result.type === 'hidden' && (
                                                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                                                            Hidden
                                                        </span>
                                                    )}
                                                    {result.type === 'sample' && (
                                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                                            Sample
                                                        </span>
                                                    )}
                                                </div>
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
                                                        {result.type === 'hidden' ? '[Hidden Input]' : result.input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span>
                                                    <pre className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                                        {result.type === 'hidden' ? '[Hidden Output]' : result.expectedOutput}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Your Output:</span>
                                                    <pre className={`mt-1 p-2 rounded text-xs overflow-x-auto ${
                                                        result.passed 
                                                            ? 'bg-green-100 dark:bg-green-800/20 text-green-800 dark:text-green-200'
                                                            : 'bg-red-100 dark:bg-red-800/20 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {result.type === 'hidden' || result.isHidden 
                                                            ? (result.passed ? '[Hidden - Check Passed]' : '[Hidden - Check Failed]')
                                                            : (result.actualOutput || 'No output')}
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

                    {/* Action Buttons and Console */}
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
                                        title="Run code with custom input"
                                    >
                                        <HiPlay className="text-sm" />
                                        <span>{isCompiling ? 'Running...' : 'Run'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleTestCode}
                                        disabled={isTesting}
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                                        title="Run sample test cases only"
                                    >
                                        <HiBeaker className="text-sm" />
                                        <span>{isTesting ? 'Testing...' : 'Test Samples'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleSubmitClick}
                                        disabled={isSubmitting}
                                        className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                                        title="Submit and run all test cases (including hidden)"
                                    >
                                        <HiUpload className="text-sm" />
                                        <span>{isSubmitting ? 'Submitting...' : 'Submit Solution'}</span>
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
                        
                        <div className="mb-4">
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                Are you sure you want to submit your solution for "{problemData.title}"?
                            </p>
                            
                            {isContestMode && (
                                <p className="text-blue-600 dark:text-blue-400 text-sm mt-3">
                                    This submission will be scored for the contest.
                                </p>
                            )}
                        </div>
                        
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
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                submissionResult.passedTestCases === submissionResult.totalTestCases
                                    ? 'bg-green-100 dark:bg-green-900'
                                    : submissionResult.passedTestCases > 0
                                    ? 'bg-yellow-100 dark:bg-yellow-900'
                                    : 'bg-red-100 dark:bg-red-900'
                            }`}>
                                {submissionResult.passedTestCases === submissionResult.totalTestCases ? (
                                    <HiCheck className="text-2xl text-green-600 dark:text-green-400" />
                                ) : (
                                    <HiExclamation className="text-2xl text-yellow-600 dark:text-yellow-400" />
                                )}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {submissionResult.passedTestCases === submissionResult.totalTestCases 
                                    ? '🎉 Accepted!' 
                                    : 'Submission Received'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {submissionResult.passedTestCases === submissionResult.totalTestCases 
                                    ? 'Congratulations! Your solution passed all test cases.' 
                                    : submissionResult.message}
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Submission ID</div>
                                <div className="font-mono text-sm">{submissionResult.submissionId}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`rounded-lg p-3 ${
                                    submissionResult.passedTestCases === submissionResult.totalTestCases 
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                        : 'bg-gray-50 dark:bg-gray-700'
                                }`}>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Test Results</div>
                                    <div className={`font-medium ${
                                        submissionResult.passedTestCases === submissionResult.totalTestCases 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : ''
                                    }`}>
                                        {submissionResult.passedTestCases}/{submissionResult.totalTestCases} Passed
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {Math.round((submissionResult.passedTestCases / submissionResult.totalTestCases) * 100)}% Success Rate
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                                    <div className={`font-medium capitalize ${
                                        submissionResult.status === 'accepted' 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : submissionResult.status === 'wrong_answer'
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {submissionResult.status === 'accepted' ? '✅ Accepted' : 
                                         submissionResult.status === 'wrong_answer' ? '⚠️ Wrong Answer' :
                                         submissionResult.status === 'runtime_error' ? '❌ Runtime Error' :
                                         submissionResult.status.replace(/_/g, ' ')}
                                    </div>
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

                            {isContestMode && submissionResult.score !== null && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <strong>Contest Score:</strong> {submissionResult.score}/{problemData.points} points
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSubmissionModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Continue Coding
                            </button>
                            <button
                                onClick={() => {
                                    setShowSubmissionModal(false);
                                    if (allTestResults) {
                                        setActiveTab('testcase');
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                View Results
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
