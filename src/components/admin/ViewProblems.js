// src/components/admin/ViewProblems.js
import React, { useState, useEffect, useCallback } from 'react';
import { HiCode, HiTrash, HiPencil, HiEye, HiArrowLeft, HiSearch } from 'react-icons/hi';
import { problemsAPI } from '../../services/api';

const ViewProblems = ({ onEdit, onDataUpdate }) => {
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail' or 'edit'
    const [editingProblem, setEditingProblem] = useState(null);
    const [statistics, setStatistics] = useState({
        totalProblems: 0,
        totalSubmissions: 0,
        avgSuccessRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        difficulty: '',
        search: '',
        tags: ''
    });
    const [pagination, setPagination] = useState({});

    const fetchProblems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await problemsAPI.getAllProblems(filters);
            
            if (response.success) {
                setProblems(response.data || []);
                setPagination(response.pagination || {});
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
            setProblems([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchProblemDetails = async (problemId) => {
        try {
            setLoading(true);
            const response = await problemsAPI.getProblemById(problemId, true);
            
            console.log('Fetched problem details:', response);
            
            if (response.success && response.data) {
                setSelectedProblem(response.data);
                setViewMode('detail');
            } else {
                alert('Failed to load problem details');
            }
        } catch (error) {
            console.error('Error fetching problem details:', error);
            alert('Error loading problem details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = useCallback(async () => {
        try {
            const response = await problemsAPI.getStatistics();
            
            if (response.success) {
                const stats = response.data;
                setStatistics({
                    totalProblems: stats.totalProblems || 0,
                    totalSubmissions: stats.submissions?.total || 0,
                    avgSuccessRate: parseFloat(stats.submissions?.successRate || 0)
                });
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    useEffect(() => {
        if (viewMode === 'list') {
            fetchProblems();
            fetchStatistics();
        }
    }, [fetchProblems, fetchStatistics, viewMode]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                const response = await problemsAPI.deleteProblem(id);
                
                if (response.success) {
                    await fetchProblems();
                    await fetchStatistics();
                    if (onDataUpdate) onDataUpdate();
                    alert('Problem deleted successfully!');
                    
                    // If we're in detail view and deleted the current problem, go back to list
                    if (viewMode === 'detail' && selectedProblem && selectedProblem._id === id) {
                        handleBackToList();
                    }
                } else {
                    alert('Failed to delete problem');
                }
            } catch (error) {
                console.error('Error deleting problem:', error);
                alert('Error deleting problem');
            }
        }
    };

    const handleEdit = async (problem) => {
        console.log('Edit button clicked for problem:', problem);
        
        // Always fetch full problem details with all test cases (including hidden ones)
        try {
            setLoading(true);
            const response = await problemsAPI.getProblemById(problem._id, true);
            
            console.log('Full API response for editing:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));
            
            // Handle different response formats
            let problemData = null;
            
            if (response.success && response.data) {
                problemData = response.data;
            } else if (response.data && !response.success) {
                problemData = response.data;
            } else if (response._id) {
                // Direct problem object without wrapper
                problemData = response;
            }
            
            if (problemData) {
                console.log('Problem data extracted:', problemData);
                console.log('Test cases in problem data:', problemData.testCases);
                console.log('Hidden test cases:', problemData.hiddenTestCases);
                console.log('Public test cases:', problemData.publicTestCases);
                
                // Combine hidden and public test cases back into one array for editing
                let allTestCases = [];
                
                if (problemData.testCases && problemData.testCases.length > 0) {
                    // If testCases array exists and has data, use it
                    allTestCases = problemData.testCases;
                } else {
                    // Otherwise, combine hiddenTestCases and publicTestCases
                    const hidden = (problemData.hiddenTestCases || []).map(tc => ({
                        ...tc,
                        isHidden: true,
                        isPublic: false
                    }));
                    
                    const visible = (problemData.publicTestCases || []).map(tc => ({
                        ...tc,
                        isHidden: false,
                        isPublic: true
                    }));
                    
                    // Combine them (visible first, then hidden)
                    allTestCases = [...visible, ...hidden];
                }
                
                console.log('Combined test cases count:', allTestCases.length);
                console.log('Combined test cases:', allTestCases);
                
                // Ensure test cases have all required fields
                const processedProblem = {
                    ...problemData,
                    testCases: allTestCases.map(tc => ({
                        input: tc.input || '',
                        output: tc.output || '',
                        description: tc.description || '',
                        isHidden: tc.isHidden !== undefined ? tc.isHidden : false,
                        isPublic: tc.isPublic !== undefined ? tc.isPublic : true
                    }))
                };
                
                console.log('Final processed problem with test cases:', processedProblem.testCases);
                setEditingProblem(processedProblem);
                setViewMode('edit');
            } else {
                console.error('No valid problem data found in response');
                alert('Failed to load problem details for editing - no data in response');
            }
        } catch (error) {
            console.error('Error fetching problem for editing:', error);
            alert('Error loading problem for editing: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleView = (problemId) => {
        console.log('View button clicked for problem ID:', problemId);
        fetchProblemDetails(problemId);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedProblem(null);
        setEditingProblem(null);
    };

    const handleSaveEdit = async (updatedProblem) => {
        try {
            setLoading(true);
            
            // Prepare the update data with all required fields
            const updateData = {
                title: updatedProblem.title,
                description: updatedProblem.description,
                difficulty: updatedProblem.difficulty,
                tags: updatedProblem.tags,
                testCases: updatedProblem.testCases,
                // Keep existing fields
                createdBy: updatedProblem.createdBy,
                isActive: updatedProblem.isActive
            };

            console.log('Updating problem with data:', updateData);
            
            const response = await problemsAPI.updateProblem(updatedProblem._id, updateData);
            
            if (response.success) {
                alert('Problem updated successfully!');
                await fetchProblems();
                await fetchStatistics();
                if (onDataUpdate) onDataUpdate();
                handleBackToList();
            } else {
                alert('Failed to update problem: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating problem:', error);
            alert('Error updating problem: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getSuccessRateColor = (rate) => {
        if (rate >= 70) return 'text-green-400';
        if (rate >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    // Edit Problem Form Component - Simplified without add/remove test cases
    const EditProblemForm = ({ problem, onSave, onCancel }) => {
        console.log('EditProblemForm received problem:', problem);
        console.log('Problem test cases:', problem?.testCases);
        
        const [formData, setFormData] = useState({
            title: problem?.title || '',
            description: problem?.description || '',
            difficulty: problem?.difficulty || 'Easy',
            tags: problem?.tags ? problem.tags.join(', ') : '',
            testCases: problem?.testCases || []
        });

        console.log('Form initialized with test cases:', formData.testCases);

        const handleInputChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleTestCaseChange = (index, field, value) => {
            const updatedTestCases = [...formData.testCases];
            updatedTestCases[index] = {
                ...updatedTestCases[index],
                [field]: value
            };
            setFormData(prev => ({
                ...prev,
                testCases: updatedTestCases
            }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            
            // Validation
            if (!formData.title.trim()) {
                alert('Title is required');
                return;
            }
            
            if (!formData.description.trim()) {
                alert('Description is required');
                return;
            }

            // Check if all test cases have input and output
            const invalidTestCase = formData.testCases.find(tc => !tc.input.trim() || !tc.output.trim());
            if (invalidTestCase) {
                alert('All test cases must have both input and output');
                return;
            }

            const updatedProblem = {
                ...problem,
                title: formData.title.trim(),
                description: formData.description.trim(),
                difficulty: formData.difficulty,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                testCases: formData.testCases
            };

            console.log('Submitting updated problem:', updatedProblem);
            onSave(updatedProblem);
        };

        return (
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={onCancel}
                            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                            title="Cancel editing"
                        >
                            <HiArrowLeft className="text-xl text-white" />
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <HiPencil className="text-2xl text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Edit Problem</h2>
                            <p className="text-gray-400">Modify problem details and test cases</p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    placeholder="Enter problem title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Difficulty *
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => handleInputChange('tags', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., arrays, sorting, dynamic programming"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-vertical"
                                    placeholder="Enter problem description"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Test Cases - Edit with Visibility Controls */}
                    <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">
                                Test Cases ({formData.testCases.length})
                            </h3>
                            <div className="text-sm text-gray-400">
                                Edit test cases and control visibility
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.testCases.map((testCase, index) => (
                                <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-semibold text-white">Test Case {index + 1}</h4>
                                        <div className="flex items-center space-x-4">
                                            {/* Visibility Controls */}
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={testCase.isHidden || false}
                                                    onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                                                    className="w-4 h-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                                                />
                                                <span className="text-sm text-gray-400">
                                                    Hidden {testCase.isHidden ? '🔒' : '🔓'}
                                                </span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={testCase.isPublic || false}
                                                    onChange={(e) => handleTestCaseChange(index, 'isPublic', e.target.checked)}
                                                    className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                                                />
                                                <span className="text-sm text-gray-400">
                                                    Public {testCase.isPublic ? '👁️' : '🚫'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Visibility Status Badge */}
                                    <div className="mb-3">
                                        {testCase.isHidden && !testCase.isPublic ? (
                                            <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
                                                🔒 Hidden from students (used for grading only)
                                            </span>
                                        ) : testCase.isPublic && !testCase.isHidden ? (
                                            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                                                👁️ Visible to students (sample test case)
                                            </span>
                                        ) : testCase.isPublic && testCase.isHidden ? (
                                            <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                                                ⚠️ Conflicting settings (both public and hidden)
                                            </span>
                                        ) : (
                                            <span className="inline-block px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs font-medium">
                                                ⚪ Private test case
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Input *
                                            </label>
                                            <textarea
                                                value={testCase.input}
                                                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-green-400 font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-vertical"
                                                placeholder="Enter input for this test case"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Expected Output *
                                            </label>
                                            <textarea
                                                value={testCase.output}
                                                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-blue-400 font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-vertical"
                                                placeholder="Enter expected output for this test case"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Explanation Text */}
                                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                                        <p className="text-xs text-gray-400">
                                            <strong className="text-gray-300">Visibility Guide:</strong><br/>
                                            • <strong>Hidden + Not Public:</strong> Test case used for grading, students cannot see it<br/>
                                            • <strong>Public + Not Hidden:</strong> Sample test case visible to students for testing<br/>
                                            • <strong>Not Hidden + Not Public:</strong> Private test case (default behavior)<br/>
                                            • Avoid setting both Hidden and Public at the same time
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {formData.testCases.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">No test cases found</div>
                                <div className="text-sm text-gray-500">
                                    This problem needs to have test cases added through the create problem form
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Cancel Changes
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <HiPencil className="text-sm" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Problem Detail View Component
    const ProblemDetailView = ({ problem }) => (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={handleBackToList}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                        title="Back to Problems List"
                    >
                        <HiArrowLeft className="text-xl text-white" />
                    </button>
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <HiCode className="text-2xl text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
                        <p className="text-gray-400">Problem Details</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => handleEdit(problem)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        title="Edit this problem"
                    >
                        <HiPencil className="text-lg" />
                        <span className="font-medium">Edit Problem</span>
                    </button>
                    <button 
                        onClick={() => handleDelete(problem._id)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        title="Delete this problem"
                    >
                        <HiTrash className="text-lg" />
                        <span className="font-medium">Delete</span>
                    </button>
                </div>
            </div>

            {/* Problem Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Difficulty</h3>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                    </span>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Submissions</h3>
                    <p className="text-3xl font-bold text-blue-400">{problem.totalSubmissions || 0}</p>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Success Rate</h3>
                    <p className={`text-3xl font-bold ${getSuccessRateColor(parseFloat(problem.successRate || 0))}`}>
                        {problem.successRate || 0}%
                    </p>
                </div>
            </div>

            {/* Problem Content */}
            <div className="space-y-8">
                {/* Description */}
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {problem.description}
                    </div>
                </div>

                {/* Tags */}
                {problem.tags && problem.tags.length > 0 && (
                    <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-3">
                            {problem.tags.map((tag, index) => (
                                <span 
                                    key={index} 
                                    className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Test Cases */}
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Test Cases ({problem.testCases?.length || 0})</h3>
                    <div className="space-y-4">
                        {problem.testCases?.map((testCase, index) => (
                            <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-3">Test Case {index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-400 mb-2">Input:</h5>
                                        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                                            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                                {testCase.input}
                                            </pre>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-400 mb-2">Expected Output:</h5>
                                        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                                            <pre className="text-blue-400 text-sm font-mono whitespace-pre-wrap">
                                                {testCase.output}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Problem Metadata */}
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Problem Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Created By</h4>
                            <p className="text-white">{problem.createdBy?.name || 'Unknown'}</p>
                            <p className="text-gray-400 text-sm">{problem.createdBy?.email || ''}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Created Date</h4>
                            <p className="text-white">{new Date(problem.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-sm">{new Date(problem.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Last Updated</h4>
                            <p className="text-white">{new Date(problem.updatedAt).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-sm">{new Date(problem.updatedAt).toLocaleTimeString()}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                problem.isActive 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                                {problem.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Show edit form if editing
    if (viewMode === 'edit' && editingProblem) {
        return (
            <EditProblemForm 
                problem={editingProblem} 
                onSave={handleSaveEdit}
                onCancel={handleBackToList}
            />
        );
    }

    // Show problem detail view if selected
    if (viewMode === 'detail' && selectedProblem) {
        return <ProblemDetailView problem={selectedProblem} />;
    }

    // Loading state
    if (loading && problems.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading problems...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header - Removed Add Problem Button */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <HiCode className="text-2xl text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Problem Library</h2>
                        <p className="text-gray-400">Manage your coding challenges</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    
                    <select
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    
                    <input
                        type="text"
                        placeholder="Filter by tags (comma-separated)"
                        value={filters.tags}
                        onChange={(e) => handleFilterChange('tags', e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    
                    <select
                        value={filters.limit}
                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Total Problems</h3>
                    <p className="text-3xl font-bold text-blue-400">{statistics.totalProblems}</p>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Total Submissions</h3>
                    <p className="text-3xl font-bold text-green-400">{statistics.totalSubmissions}</p>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Avg Success Rate</h3>
                    <p className="text-3xl font-bold text-yellow-400">{statistics.avgSuccessRate}%</p>
                </div>
            </div>

            {/* Problems List */}
            <div className="bg-gray-800/30 border border-gray-600 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-600">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">All Problems</h3>
                        {pagination.totalProblems && (
                            <p className="text-gray-400 text-sm">
                                Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalProblems)} of {pagination.totalProblems} problems
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="divide-y divide-gray-600">
                    {problems.map((problem) => (
                        <div key={problem._id} className="p-6 hover:bg-gray-700/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                {/* Problem Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-4 mb-2">
                                        <h4 className="text-lg font-bold text-white truncate">
                                            {problem.title}
                                        </h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                        {problem.tags && problem.tags.length > 0 && (
                                            <div className="flex space-x-2">
                                                {problem.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {problem.tags.length > 3 && (
                                                    <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                                                        +{problem.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3 max-w-2xl">
                                        {problem.description && problem.description.length > 150 
                                            ? problem.description.substring(0, 150) + '...'
                                            : problem.description
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Created by: {problem.createdBy?.name || 'Unknown'} • 
                                        Created: {new Date(problem.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center space-x-8 mx-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-400">{problem.totalSubmissions || 0}</p>
                                        <p className="text-xs text-gray-400">Submissions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-2xl font-bold ${getSuccessRateColor(parseFloat(problem.successRate || 0))}`}>
                                            {problem.successRate || 0}%
                                        </p>
                                        <p className="text-xs text-gray-400">Success Rate</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => handleView(problem._id)}
                                        className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                                        title="View problem details"
                                    >
                                        <HiEye className="text-sm" />
                                        <span className="text-sm font-medium">View</span>
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(problem)}
                                        className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all duration-300"
                                        title="Edit this problem"
                                    >
                                        <HiPencil className="text-sm" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(problem._id)}
                                        className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                                        title="Delete this problem"
                                    >
                                        <HiTrash className="text-sm" />
                                        <span className="text-sm font-medium">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-6 border-t border-gray-600">
                        <div className="flex justify-center items-center space-x-4">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                Previous
                            </button>
                            
                            <span className="text-gray-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {!loading && problems.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiCode className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Problems Found</h3>
                    <p className="text-gray-400 mb-6">
                        {filters.search || filters.difficulty || filters.tags 
                            ? 'No problems match your current filters' 
                            : 'No problems available in the system'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default ViewProblems;
