// src/components/admin/ViewProblems.js
import React, { useState, useEffect } from 'react';
import { HiCode, HiTrash, HiPencil, HiEye, HiPlus, HiSearch, HiFilter } from 'react-icons/hi';
import { problemsAPI } from '../../services/api';

const ViewProblems = ({ onDataUpdate, onEdit }) => {
    const [problems, setProblems] = useState([]);
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

    useEffect(() => {
        fetchProblems();
        fetchStatistics();
    }, [filters]);

    const fetchProblems = async () => {
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
    };

    const fetchStatistics = async () => {
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
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                const response = await problemsAPI.deleteProblem(id);
                
                if (response.success) {
                    await fetchProblems();
                    await fetchStatistics();
                    if (onDataUpdate) onDataUpdate();
                    alert('Problem deleted successfully!');
                } else {
                    alert('Failed to delete problem');
                }
            } catch (error) {
                console.error('Error deleting problem:', error);
                alert('Error deleting problem');
            }
        }
    };

    const handleEdit = (problem) => {
        if (onEdit) {
            onEdit(problem);
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
                {!onEdit && (
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <HiPlus className="text-lg" />
                        <span className="font-medium">Add Problem</span>
                    </button>
                )}
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
                                    <button className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                                        <HiEye className="text-sm" />
                                        <span className="text-sm font-medium">View</span>
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(problem)}
                                        className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all duration-300"
                                    >
                                        <HiPencil className="text-sm" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(problem._id)}
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
                            : 'Start by creating your first coding problem'
                        }
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300">
                        Create Problem
                    </button>
                </div>
            )}
        </div>
    );
};

export default ViewProblems;
