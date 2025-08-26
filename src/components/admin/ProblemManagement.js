// src/components/admin/ProblemManagement.js
import React, { useState, useEffect } from 'react';
import { HiPlus, HiCode, HiArrowLeft, HiSave, HiTrash } from 'react-icons/hi';
import { problemsAPI, authAPI } from '../../services/api';
import ViewProblems from './ViewProblems';

const ProblemManagement = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'edit'
    const [editingProblem, setEditingProblem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        tags: [],
        testCases: [{ input: '', output: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            // Get the current username from localStorage (set during login)
            const currentUsername = localStorage.getItem('currentUser');
            
            if (!currentUsername) {
                console.log('No current user found, using mock admin user');
                // Create mock admin user for development
                const mockUser = {
                    _id: '68ad4516c3be4979ebac1d49', // Your actual admin ID from database
                    name: 'Admin User',
                    email: 'admin@example.com',
                    username: 'admin'
                };
                setCurrentUser(mockUser);
                return;
            }

            // For admin, use the actual admin ID from your database
            if (currentUsername === 'admin') {
                const adminUser = {
                    _id: '68ad4516c3be4979ebac1d49', // Your actual admin ID from database
                    name: 'Admin User',
                    email: 'admin@example.com',
                    username: 'admin'
                };
                setCurrentUser(adminUser);
                
                // Also store in localStorage for authAPI compatibility
                authAPI.setCurrentUser(adminUser);
                console.log('Admin user set:', adminUser);
                return;
            }

            // For other users, try to get from authAPI or create mock
            let user = authAPI.getCurrentUser();
            if (!user) {
                // Create mock user
                user = {
                    _id: '68ad4516c3be4979ebac1d49', // Fallback to admin ID
                    name: currentUsername,
                    email: `${currentUsername}@example.com`,
                    username: currentUsername
                };
                authAPI.setCurrentUser(user);
            }
            
            setCurrentUser(user);
            console.log('Current user set:', user);
            
        } catch (error) {
            console.error('Error getting current user:', error);
            
            // Fallback to admin user
            const adminUser = {
                _id: '68ad4516c3be4979ebac1d49', // Your actual admin ID
                name: 'Admin User',
                email: 'admin@example.com',
                username: 'admin'
            };
            setCurrentUser(adminUser);
            authAPI.setCurrentUser(adminUser);
            console.log('Fallback admin user set:', adminUser);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTagsChange = (value) => {
        const tagsArray = value.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
        setFormData(prev => ({
            ...prev,
            tags: tagsArray
        }));
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index] = {
            ...newTestCases[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            testCases: newTestCases
        }));
    };

    const addTestCase = () => {
        setFormData(prev => ({
            ...prev,
            testCases: [...prev.testCases, { input: '', output: '' }]
        }));
    };

    const removeTestCase = (index) => {
        if (formData.testCases.length > 1) {
            const newTestCases = formData.testCases.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                testCases: newTestCases
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser?._id) {
            alert('User not found. Please refresh the page and try again.');
            return;
        }

        // Validate form
        if (!formData.title.trim() || !formData.description.trim()) {
            alert('Title and description are required');
            return;
        }

        if (formData.testCases.some(tc => !tc.input.trim() || !tc.output.trim())) {
            alert('All test cases must have both input and output');
            return;
        }

        setLoading(true);
        try {
            // Prepare problem data
            const problemData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                difficulty: formData.difficulty,
                tags: formData.tags,
                testCases: formData.testCases.map(tc => ({
                    input: tc.input.trim(),
                    output: tc.output.trim()
                })),
                createdBy: currentUser._id // Send the user ID string
            };

            console.log('Submitting problem data:', problemData);

            let response;
            if (editingProblem) {
                response = await problemsAPI.updateProblem(editingProblem._id, problemData);
            } else {
                response = await problemsAPI.createProblem(problemData);
            }

            console.log('API Response:', response);

            if (response.success) {
                alert(`Problem ${editingProblem ? 'updated' : 'created'} successfully!`);
                resetForm();
                setActiveTab('list');
            } else {
                console.error('API Error:', response.error);
                alert(`Failed to ${editingProblem ? 'update' : 'create'} problem: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving problem:', error);
            alert(`Error ${editingProblem ? 'updating' : 'creating'} problem: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            difficulty: 'Easy',
            tags: [],
            testCases: [{ input: '', output: '' }]
        });
        setEditingProblem(null);
    };

    const handleEdit = (problem) => {
        setEditingProblem(problem);
        setFormData({
            title: problem.title || '',
            description: problem.description || '',
            difficulty: problem.difficulty || 'Easy',
            tags: problem.tags || [],
            testCases: problem.testCases && problem.testCases.length > 0 
                ? problem.testCases.map(tc => ({
                    input: tc.input || '',
                    output: tc.output || ''
                  }))
                : [{ input: '', output: '' }]
        });
        setActiveTab('create');
    };

    const renderProblemForm = () => (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            resetForm();
                            setActiveTab('list');
                        }}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <HiArrowLeft className="text-lg" />
                        <span>Back to Problems</span>
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-white">
                    {editingProblem ? 'Edit Problem' : 'Create New Problem'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Problem Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Enter problem title..."
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Problem Description *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Describe the problem in detail..."
                        required
                    />
                </div>

                {/* Difficulty and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Difficulty Level
                        </label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => handleInputChange('difficulty', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                            value={formData.tags.join(', ')}
                            onChange={(e) => handleTagsChange(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="array, sorting, dynamic programming..."
                        />
                    </div>
                </div>

                {/* Test Cases */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                            Test Cases *
                        </label>
                        <button
                            type="button"
                            onClick={addTestCase}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <HiPlus className="text-sm" />
                            <span>Add Test Case</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.testCases.map((testCase, index) => (
                            <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-white font-medium">Test Case {index + 1}</h4>
                                    {formData.testCases.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTestCase(index)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <HiTrash className="text-lg" />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">
                                            Input
                                        </label>
                                        <textarea
                                            value={testCase.input}
                                            onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                            placeholder="Enter test input..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">
                                            Expected Output
                                        </label>
                                        <textarea
                                            value={testCase.output}
                                            onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                            placeholder="Enter expected output..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setActiveTab('list');
                        }}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiSave className="text-lg" />
                        <span>{loading ? 'Saving...' : (editingProblem ? 'Update Problem' : 'Create Problem')}</span>
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <HiCode className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Problem Management</h1>
                            <p className="text-gray-400">Create and manage coding challenges</p>
                        </div>
                    </div>

                    {activeTab === 'list' && (
                        <button
                            onClick={() => setActiveTab('create')}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            <HiPlus className="text-lg" />
                            <span className="font-medium">Create Problem</span>
                        </button>
                    )}
                </div>

                {/* Debug Info - Remove in production */}
                {process.env.NODE_ENV === 'development' && currentUser && (
                    <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">
                            <strong>Debug:</strong> Current User: {currentUser.name} (ID: {currentUser._id})
                        </p>
                    </div>
                )}

                {/* Content */}
                {activeTab === 'list' ? (
                    <ViewProblems onEdit={handleEdit} />
                ) : (
                    renderProblemForm()
                )}
            </div>
        </div>
    );
};

export default ProblemManagement;
