// src/components/admin/ViewProblems.js
import React, { useState } from 'react';
import { HiCode, HiTrash, HiPencil, HiEye, HiPlus } from 'react-icons/hi';

const ViewProblems = () => {
    const [problems, setProblems] = useState([
        { 
            id: 1, 
            title: 'Two Sum', 
            description: 'Find two numbers that add up to a target.',
            difficulty: 'Easy',
            category: 'Array',
            submissions: 45,
            successRate: 78
        },
        { 
            id: 2, 
            title: 'Add Two Numbers', 
            description: 'Add two numbers represented by linked lists.',
            difficulty: 'Medium',
            category: 'Linked List',
            submissions: 32,
            successRate: 65
        },
        { 
            id: 3, 
            title: 'Longest Substring Without Repeating Characters', 
            description: 'Find the longest substring without repeating characters.',
            difficulty: 'Medium',
            category: 'String',
            submissions: 28,
            successRate: 52
        },
    ]);

    const handleDelete = (id) => {
        const updatedProblems = problems.filter(problem => problem.id !== id);
        setProblems(updatedProblems);
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

    return (
        <div className="p-8">
            {/* Header */}
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
                <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <HiPlus className="text-lg" />
                    <span className="font-medium">Add Problem</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Total Problems</h3>
                    <p className="text-3xl font-bold text-blue-400">{problems.length}</p>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Total Submissions</h3>
                    <p className="text-3xl font-bold text-green-400">
                        {problems.reduce((acc, p) => acc + p.submissions, 0)}
                    </p>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Avg Success Rate</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                        {Math.round(problems.reduce((acc, p) => acc + p.successRate, 0) / problems.length)}%
                    </p>
                </div>
            </div>

            {/* Problems Table/List */}
            <div className="bg-gray-800/30 border border-gray-600 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-600">
                    <h3 className="text-xl font-bold text-white">All Problems</h3>
                </div>
                
                <div className="divide-y divide-gray-600">
                    {problems.map((problem) => (
                        <div key={problem.id} className="p-6 hover:bg-gray-700/30 transition-all duration-300">
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
                                        <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                                            {problem.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3 max-w-2xl">
                                        {problem.description}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center space-x-8 mx-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-400">{problem.submissions}</p>
                                        <p className="text-xs text-gray-400">Submissions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-2xl font-bold ${getSuccessRateColor(problem.successRate)}`}>
                                            {problem.successRate}%
                                        </p>
                                        <p className="text-xs text-gray-400">Success Rate</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                                        <HiEye className="text-sm" />
                                        <span className="text-sm font-medium">View</span>
                                    </button>
                                    <button className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all duration-300">
                                        <HiPencil className="text-sm" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(problem.id)}
                                        className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                                    >
                                        <HiTrash className="text-sm" />
                                        <span className="text-sm font-medium">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {problems.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiCode className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Problems Found</h3>
                    <p className="text-gray-400 mb-6">Start by creating your first coding problem</p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300">
                        Create Problem
                    </button>
                </div>
            )}
        </div>
    );
};

export default ViewProblems;
