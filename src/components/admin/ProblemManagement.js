// src/components/admin/ProblemManagement.js
import React, { useState } from 'react';
import { HiPlus, HiTrash, HiCode, HiLightBulb } from 'react-icons/hi';

const ProblemManagement = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [testCases, setTestCases] = useState([{ input: '', output: '' }]);

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        const updatedTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(updatedTestCases);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Problem submitted:', { title, description, category, testCases });
        setTitle('');
        setDescription('');
        setCategory('');
        setTestCases([{ input: '', output: '' }]);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'from-green-400 to-emerald-500';
            case 'Medium': return 'from-yellow-400 to-orange-500';
            case 'Hard': return 'from-red-400 to-pink-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                        <HiCode className="text-2xl text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Problem Creation Studio</h1>
                    <p className="text-gray-300 text-lg">Design challenging coding problems for your students</p>
                </div>

                {/* Main Form */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Problem Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                    Problem Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Enter problem title..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                    Difficulty Level
                                </label>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                    required
                                >
                                    <option value="" disabled>Select Difficulty</option>
                                    <option value="Easy">🟢 Easy</option>
                                    <option value="Medium">🟡 Medium</option>
                                    <option value="Hard">🔴 Hard</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                                Problem Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="6"
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                                placeholder="Describe the problem in detail..."
                                required
                            />
                        </div>

                        {/* Test Cases */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <HiLightBulb className="mr-2 text-yellow-400" />
                                    Test Cases
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={addTestCase} 
                                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <HiPlus className="text-sm" />
                                    <span>Add Test Case</span>
                                </button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {testCases.map((testCase, index) => (
                                    <div key={index} className="bg-gray-800/30 border border-gray-600 rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-lg font-semibold text-white">Test Case {index + 1}</h4>
                                            {testCases.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeTestCase(index)} 
                                                    className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                                                >
                                                    <HiTrash className="text-sm" />
                                                    <span className="text-xs">Remove</span>
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Input</label>
                                                <textarea
                                                    value={testCase.input}
                                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                    rows="3"
                                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
                                                    placeholder="Enter input..."
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Expected Output</label>
                                                <textarea
                                                    value={testCase.output}
                                                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                                    rows="3"
                                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
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
                        <div className="flex justify-center pt-6">
                            <button 
                                type="submit" 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-12 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-purple-700 hover:to-pink-700"
                            >
                                Create Problem
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProblemManagement;
