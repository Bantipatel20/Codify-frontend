// src/components/admin/Contest.js
import React, { useState } from 'react';
import { HiStar, HiPlus, HiUsers, HiCode, HiCalendar, HiClock, HiEye, HiPencil, HiTrash, HiPlay, HiStop, HiChartBar, HiDownload, HiFilter } from 'react-icons/hi';

const Contest = () => {
    // Sample data - replace with API calls
    const [contests, setContests] = useState([
        {
            id: 1,
            title: 'Programming Contest 2024',
            description: 'Annual programming contest for CSE students',
            startDate: '2024-02-15T10:00',
            endDate: '2024-02-15T13:00',
            duration: '3 hours',
            status: 'Upcoming',
            problems: [
                { id: 1, title: 'Two Sum', difficulty: 'Easy', points: 100 },
                { id: 2, title: 'Binary Search', difficulty: 'Medium', points: 200 }
            ],
            participants: [
                { id: 1, name: 'Banti', department: 'CSE', semester: 3, division: 1, batch: 'A1', score: 0, submissions: 0 },
                { id: 2, name: 'Dhaval', department: 'CSE', semester: 3, division: 1, batch: 'B1', score: 0, submissions: 0 }
            ],
            maxParticipants: 100,
            totalPoints: 300,
            createdBy: 'Admin',
            createdAt: '2024-01-20',
            rules: 'Standard ACM ICPC rules apply'
        },
        {
            id: 2,
            title: 'Data Structures Challenge',
            description: 'Focus on advanced data structures',
            startDate: '2024-02-20T14:00',
            endDate: '2024-02-20T17:00',
            duration: '3 hours',
            status: 'Active',
            problems: [
                { id: 3, title: 'Tree Traversal', difficulty: 'Medium', points: 150 },
                { id: 4, title: 'Graph Algorithms', difficulty: 'Hard', points: 300 }
            ],
            participants: [
                { id: 3, name: 'Shashan', department: 'CSE', semester: 3, division: 2, batch: 'A2', score: 150, submissions: 3 }
            ],
            maxParticipants: 50,
            totalPoints: 450,
            createdBy: 'Admin',
            createdAt: '2024-01-25',
            rules: 'Time-based scoring system'
        }
    ]);

    const [problems] = useState([
        { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Array', points: 100 },
        { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', points: 200 },
        { id: 3, title: 'Longest Substring', difficulty: 'Medium', category: 'String', points: 200 },
        { id: 4, title: 'Median of Arrays', difficulty: 'Hard', category: 'Array', points: 300 },
        { id: 5, title: 'Binary Search', difficulty: 'Medium', category: 'Search', points: 150 },
        { id: 6, title: 'Tree Traversal', difficulty: 'Medium', category: 'Tree', points: 150 },
        { id: 7, title: 'Graph Algorithms', difficulty: 'Hard', category: 'Graph', points: 300 }
    ]);

    const [students] = useState([
        { id: 1, name: 'Banti', email: '23cs058@example.com', department: 'CSE', semester: 3, division: 1, batch: 'A1' },
        { id: 2, name: 'Dhaval', email: '23cs060@example.com', department: 'CSE', semester: 3, division: 1, batch: 'B1' },
        { id: 3, name: 'Shashan', email: '23cs042@example.com', department: 'CSE', semester: 3, division: 2, batch: 'A2' },
        { id: 4, name: 'Raj', email: '23cs055@example.com', department: 'CSE', semester: 5, division: 1, batch: 'A1' },
        { id: 5, name: 'Priya', email: '23it045@example.com', department: 'IT', semester: 3, division: 1, batch: 'B1' },
        { id: 6, name: 'Amit', email: '23cs067@example.com', department: 'CSE', semester: 3, division: 1, batch: 'C1' }
    ]);

    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);
    const [filters, setFilters] = useState({
        status: 'All',
        department: 'All',
        dateRange: 'All'
    });

    // New contest form state
    const [newContest, setNewContest] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: '',
        rules: '',
        maxParticipants: 100,
        selectedProblems: [],
        participantSelection: 'manual', // manual, department, semester, division, batch
        selectedParticipants: [],
        filterCriteria: {
            department: '',
            semester: '',
            division: '',
            batch: ''
        }
    });

    // Utility functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const calculateDuration = (start, end) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffHours = Math.abs(endTime - startTime) / 36e5;
        return `${diffHours} hours`;
    };

    // Contest management functions
    const handleCreateContest = (e) => {
        e.preventDefault();
        const contest = {
            id: contests.length + 1,
            ...newContest,
            participants: newContest.selectedParticipants.map(id => {
                const student = students.find(s => s.id === id);
                return { ...student, score: 0, submissions: 0 };
            }),
            problems: newContest.selectedProblems.map(id => problems.find(p => p.id === id)),
            totalPoints: newContest.selectedProblems.reduce((sum, id) => {
                const problem = problems.find(p => p.id === id);
                return sum + (problem?.points || 0);
            }, 0),
            status: 'Upcoming',
            createdBy: 'Admin',
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        setContests([...contests, contest]);
        resetNewContestForm();
        setShowCreateModal(false);
    };

    const resetNewContestForm = () => {
        setNewContest({
            title: '', description: '', startDate: '', endDate: '', duration: '', rules: '',
            maxParticipants: 100, selectedProblems: [], participantSelection: 'manual',
            selectedParticipants: [], filterCriteria: { department: '', semester: '', division: '', batch: '' }
        });
    };

    const handleDeleteContest = (contestId) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            setContests(contests.filter(c => c.id !== contestId));
        }
    };

    const handleStartContest = (contestId) => {
        setContests(contests.map(c => 
            c.id === contestId ? { ...c, status: 'Active' } : c
        ));
    };

    const handleEndContest = (contestId) => {
        setContests(contests.map(c => 
            c.id === contestId ? { ...c, status: 'Completed' } : c
        ));
    };

    const getFilteredStudents = () => {
        if (newContest.participantSelection === 'manual') return students;
        
        return students.filter(student => {
            const { department, semester, division, batch } = newContest.filterCriteria;
            return (!department || student.department === department) &&
                   (!semester || student.semester === parseInt(semester)) &&
                   (!division || student.division === parseInt(division)) &&
                   (!batch || student.batch === batch);
        });
    };

    const filteredContests = contests.filter(contest => {
        return (filters.status === 'All' || contest.status === filters.status) &&
               (filters.department === 'All' || contest.participants.some(p => p.department === filters.department));
    });

    const tabs = [
        { id: 'overview', name: 'Overview', icon: HiStar },
        { id: 'active', name: 'Active Contests', icon: HiPlay },
        { id: 'completed', name: 'Completed', icon: HiChartBar },
        { id: 'analytics', name: 'Analytics', icon: HiChartBar }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl mb-6">
                        <HiStar className="text-3xl text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Contest Management Hub</h1>
                    <p className="text-gray-300 text-xl">Create, manage, and monitor programming contests</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                <IconComponent className="text-lg" />
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <HiPlus className="text-lg" />
                                <span className="font-medium">Create Contest</span>
                            </button>
                            
                            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                <HiDownload className="text-lg" />
                                <span className="font-medium">Export Data</span>
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Contests</p>
                                        <p className="text-3xl font-bold text-white">{contests.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <HiStar className="text-blue-400 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Active Contests</p>
                                        <p className="text-3xl font-bold text-green-400">
                                            {contests.filter(c => c.status === 'Active').length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <HiPlay className="text-green-400 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Participants</p>
                                        <p className="text-3xl font-bold text-purple-400">
                                            {contests.reduce((sum, c) => sum + c.participants.length, 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <HiUsers className="text-purple-400 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Problems</p>
                                        <p className="text-3xl font-bold text-yellow-400">
                                            {contests.reduce((sum, c) => sum + c.problems.length, 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                        <HiCode className="text-yellow-400 text-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <HiFilter className="text-blue-400 text-xl" />
                                <h3 className="text-lg font-semibold text-white">Filter Contests</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select 
                                        value={filters.status}
                                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                                    <select 
                                        value={filters.department}
                                        onChange={(e) => setFilters({...filters, department: e.target.value})}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="All">All Departments</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                                    <select 
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="All">All Time</option>
                                        <option value="Today">Today</option>
                                        <option value="This Week">This Week</option>
                                        <option value="This Month">This Month</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contests List */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <h2 className="text-2xl font-bold text-white">All Contests ({filteredContests.length})</h2>
                            </div>
                            
                            <div className="divide-y divide-gray-600">
                                {filteredContests.map((contest) => (
                                    <div key={contest.id} className="p-6 hover:bg-gray-700/30 transition-all duration-300">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-3">
                                                    <h3 className="text-xl font-bold text-white">{contest.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                                                        {contest.status}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-300 mb-4 max-w-2xl">{contest.description}</p>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                        <HiCalendar className="w-4 h-4" />
                                                        <span>{formatDate(contest.startDate)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                        <HiClock className="w-4 h-4" />
                                                        <span>{contest.duration}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                        <HiUsers className="w-4 h-4" />
                                                        <span>{contest.participants.length}/{contest.maxParticipants}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                        <HiCode className="w-4 h-4" />
                                                        <span>{contest.problems.length} problems</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {contest.problems.map((problem, index) => (
                                                        <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                                            {problem.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col space-y-2 ml-6">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedContest(contest);
                                                        setShowParticipantsModal(true);
                                                    }}
                                                    className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 text-sm"
                                                >
                                                    <HiUsers className="w-4 h-4" />
                                                    <span>Participants</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => {
                                                        setSelectedContest(contest);
                                                        setShowLeaderboardModal(true);
                                                    }}
                                                    className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 text-sm"
                                                >
                                                    <HiChartBar className="w-4 h-4" />
                                                    <span>Leaderboard</span>
                                                </button>
                                                
                                                {contest.status === 'Upcoming' && (
                                                    <button 
                                                        onClick={() => handleStartContest(contest.id)}
                                                        className="flex items-center space-x-1 bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg hover:bg-purple-500/30 text-sm"
                                                    >
                                                        <HiPlay className="w-4 h-4" />
                                                        <span>Start</span>
                                                    </button>
                                                )}
                                                
                                                {contest.status === 'Active' && (
                                                    <button 
                                                        onClick={() => handleEndContest(contest.id)}
                                                        className="flex items-center space-x-1 bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg hover:bg-orange-500/30 text-sm"
                                                    >
                                                        <HiStop className="w-4 h-4" />
                                                        <span>End</span>
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    onClick={() => {
                                                        setSelectedContest(contest);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg hover:bg-yellow-500/30 text-sm"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDeleteContest(contest.id)}
                                                    className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 text-sm"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Contests Tab */}
                {activeTab === 'active' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Currently Active Contests</h2>
                            
                            {contests.filter(c => c.status === 'Active').length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiPlay className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Active Contests</h3>
                                    <p className="text-gray-400">All contests are either upcoming or completed</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {contests.filter(c => c.status === 'Active').map(contest => (
                                        <div key={contest.id} className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                                                    <p className="text-gray-300 mb-4">{contest.description}</p>
                                                    <div className="flex items-center space-x-6 text-sm">
                                                        <span className="text-green-400">🟢 Live Now</span>
                                                        <span className="text-gray-400">
                                                            {contest.participants.length} participants
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Ends: {formatDate(contest.endDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedContest(contest);
                                                        setShowLeaderboardModal(true);
                                                    }}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                                >
                                                    View Live Results
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Completed Contests Tab */}
                {activeTab === 'completed' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Completed Contests</h2>
                            
                            {contests.filter(c => c.status === 'Completed').length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiStar className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Completed Contests</h3>
                                    <p className="text-gray-400">Completed contests will appear here</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {contests.filter(c => c.status === 'Completed').map(contest => (
                                        <div key={contest.id} className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                                                    <p className="text-gray-300 mb-4">{contest.description}</p>
                                                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                                                        <span>Completed: {formatDate(contest.endDate)}</span>
                                                        <span>{contest.participants.length} participants</span>
                                                        <span>{contest.problems.length} problems</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedContest(contest);
                                                            setShowLeaderboardModal(true);
                                                        }}
                                                        className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30"
                                                    >
                                                        Final Results
                                                    </button>
                                                    <button className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30">
                                                        Export Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Contest Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Contests:</span>
                                        <span className="text-white font-medium">{contests.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Avg Participants:</span>
                                        <span className="text-white font-medium">
                                            {Math.round(contests.reduce((sum, c) => sum + c.participants.length, 0) / contests.length) || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Success Rate:</span>
                                        <span className="text-green-400 font-medium">78%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Popular Problems</h3>
                                <div className="space-y-2">
                                    {problems.slice(0, 4).map(problem => (
                                        <div key={problem.id} className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">{problem.title}</span>
                                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Department Participation</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">CSE:</span>
                                        <span className="text-blue-400 font-medium">65%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">IT:</span>
                                        <span className="text-green-400 font-medium">25%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">ECE:</span>
                                        <span className="text-yellow-400 font-medium">10%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {contests.slice(0, 5).map(contest => (
                                    <div key={contest.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                                        <div>
                                            <h4 className="text-white font-medium">{contest.title}</h4>
                                            <p className="text-gray-400 text-sm">
                                                {contest.participants.length} participants • Created {contest.createdAt}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                                            {contest.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Contest Modal */}
            {showCreateModal && (
                <CreateContestModal
                    newContest={newContest}
                    setNewContest={setNewContest}
                    problems={problems}
                    students={students}
                    getFilteredStudents={getFilteredStudents}
                    onSubmit={handleCreateContest}
                    onClose={() => {
                        setShowCreateModal(false);
                        resetNewContestForm();
                    }}
                />
            )}

            {/* Participants Modal */}
            {showParticipantsModal && selectedContest && (
                <ParticipantsModal
                    contest={selectedContest}
                    onClose={() => {
                        setShowParticipantsModal(false);
                        setSelectedContest(null);
                    }}
                />
            )}

            {/* Leaderboard Modal */}
            {showLeaderboardModal && selectedContest && (
                <LeaderboardModal
                    contest={selectedContest}
                    onClose={() => {
                        setShowLeaderboardModal(false);
                        setSelectedContest(null);
                    }}
                />
            )}
        </div>
    );
};

// Create Contest Modal Component
const CreateContestModal = ({ newContest, setNewContest, problems, students, getFilteredStudents, onSubmit, onClose }) => {
    const handleProblemSelection = (problemId) => {
        const updatedProblems = newContest.selectedProblems.includes(problemId)
            ? newContest.selectedProblems.filter(p => p !== problemId)
            : [...newContest.selectedProblems, problemId];
        
        setNewContest({ ...newContest, selectedProblems: updatedProblems });
    };

    const handleParticipantSelection = (studentId) => {
        const updatedParticipants = newContest.selectedParticipants.includes(studentId)
            ? newContest.selectedParticipants.filter(p => p !== studentId)
            : [...newContest.selectedParticipants, studentId];
        
        setNewContest({ ...newContest, selectedParticipants: updatedParticipants });
    };

    const selectAllFilteredStudents = () => {
        const filteredIds = getFilteredStudents().map(s => s.id);
        setNewContest({ ...newContest, selectedParticipants: filteredIds });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/20 text-green-400';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'Hard': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Create New Contest</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Contest Title</label>
                                <input
                                    type="text"
                                    value={newContest.title}
                                    onChange={(e) => setNewContest({...newContest, title: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    placeholder="Enter contest title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                                <input
                                    type="number"
                                    value={newContest.maxParticipants}
                                    onChange={(e) => setNewContest({...newContest, maxParticipants: parseInt(e.target.value)})}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={newContest.description}
                                onChange={(e) => setNewContest({...newContest, description: e.target.value})}
                                rows="3"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                placeholder="Enter contest description"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={newContest.startDate}
                                    onChange={(e) => setNewContest({...newContest, startDate: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={newContest.endDate}
                                    onChange={(e) => setNewContest({...newContest, endDate: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                                <input
                                    type="text"
                                    value={newContest.duration}
                                    onChange={(e) => setNewContest({...newContest, duration: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    placeholder="e.g., 3 hours"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contest Rules</label>
                            <textarea
                                value={newContest.rules}
                                onChange={(e) => setNewContest({...newContest, rules: e.target.value})}
                                rows="3"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                placeholder="Enter contest rules and guidelines"
                            />
                        </div>
                    </div>

                    {/* Problem Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Select Problems</h3>
                        <div className="grid md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                            {problems.map(problem => (
                                <div key={problem.id} className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={newContest.selectedProblems.includes(problem.id)}
                                        onChange={() => handleProblemSelection(problem.id)}
                                        className="w-4 h-4 text-purple-600"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-medium">{problem.title}</span>
                                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-gray-400 text-sm">{problem.category}</span>
                                            <span className="text-yellow-400 text-sm">{problem.points} pts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400">
                            Selected: {newContest.selectedProblems.length} problems
                        </p>
                    </div>

                    {/* Participant Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Participant Selection</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Selection Method</label>
                            <select
                                value={newContest.participantSelection}
                                onChange={(e) => setNewContest({...newContest, participantSelection: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                            >
                                <option value="manual">Manual Selection</option>
                                <option value="department">By Department</option>
                                <option value="semester">By Semester</option>
                                <option value="division">By Division</option>
                                <option value="batch">By Batch</option>
                            </select>
                        </div>

                        {newContest.participantSelection !== 'manual' && (
                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                                    <select
                                        value={newContest.filterCriteria.department}
                                        onChange={(e) => setNewContest({
                                            ...newContest,
                                            filterCriteria: {...newContest.filterCriteria, department: e.target.value}
                                        })}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="">All Departments</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                                    <select
                                        value={newContest.filterCriteria.semester}
                                        onChange={(e) => setNewContest({
                                            ...newContest,
                                            filterCriteria: {...newContest.filterCriteria, semester: e.target.value}
                                        })}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="">All Semesters</option>
                                        {[1,2,3,4,5,6,7,8].map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Division</label>
                                    <select
                                        value={newContest.filterCriteria.division}
                                        onChange={(e) => setNewContest({
                                            ...newContest,
                                            filterCriteria: {...newContest.filterCriteria, division: e.target.value}
                                        })}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="">All Divisions</option>
                                        {[1,2,3,4].map(div => (
                                            <option key={div} value={div}>Division {div}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
                                    <select
                                        value={newContest.filterCriteria.batch}
                                        onChange={(e) => setNewContest({
                                            ...newContest,
                                            filterCriteria: {...newContest.filterCriteria, batch: e.target.value}
                                        })}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="">All Batches</option>
                                        {['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3', 'A4', 'B4', 'C4'].map(batch => (
                                            <option key={batch} value={batch}>{batch}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-white font-medium">
                                    Available Students ({getFilteredStudents().length})
                                </h4>
                                <button
                                    type="button"
                                    onClick={selectAllFilteredStudents}
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Select All Filtered
                                </button>
                            </div>
                            <div className="space-y-2">
                                {getFilteredStudents().map(student => (
                                    <div key={student.id} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={newContest.selectedParticipants.includes(student.id)}
                                            onChange={() => handleParticipantSelection(student.id)}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <div className="flex-1">
                                            <span className="text-white">{student.name}</span>
                                            <span className="text-gray-400 text-sm ml-2">
                                                {student.department} - Sem {student.semester} - Div {student.division} - {student.batch}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">
                            Selected: {newContest.selectedParticipants.length} participants
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg"
                            disabled={newContest.selectedProblems.length === 0 || newContest.selectedParticipants.length === 0}
                        >
                            Create Contest
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Participants Modal Component
const ParticipantsModal = ({ contest, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Contest Participants</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-gray-400 mt-2">{contest.title}</p>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-white">
                            Total Participants: <span className="font-bold text-blue-400">{contest.participants.length}</span>
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Department</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Academic Info</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Submissions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {contest.participants.map((participant) => (
                                    <tr key={participant.id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-white font-medium">{participant.name}</div>
                                                <div className="text-gray-400 text-sm">{participant.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{participant.department}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-300 text-sm">
                                                Sem {participant.semester} • Div {participant.division} • {participant.batch}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-green-400 font-bold">{participant.score || 0}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-blue-400">{participant.submissions || 0}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Leaderboard Modal Component
const LeaderboardModal = ({ contest, onClose }) => {
    const sortedParticipants = [...contest.participants].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Contest Leaderboard</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-gray-400 mt-2">{contest.title}</p>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Rank</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Participant</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Submissions</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Department</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {sortedParticipants.map((participant, index) => (
                                    <tr key={participant.id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                {index === 0 && <span className="text-yellow-400 mr-2">🥇</span>}
                                                {index === 1 && <span className="text-gray-300 mr-2">🥈</span>}
                                                {index === 2 && <span className="text-orange-400 mr-2">🥉</span>}
                                                <span className="text-white font-bold">#{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-white font-medium">{participant.name}</div>
                                                <div className="text-gray-400 text-sm">
                                                    Sem {participant.semester} • Div {participant.division} • {participant.batch}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-green-400 font-bold text-lg">{participant.score || 0}</span>
                                            <span className="text-gray-400 text-sm ml-1">/ {contest.totalPoints}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-blue-400">{participant.submissions || 0}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-300">{participant.department}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contest;
