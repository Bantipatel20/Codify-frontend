// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClipboardList, HiUserGroup, HiChartBar, HiCog, HiLogout, HiSparkles, HiStar } from 'react-icons/hi';
import { problemsAPI, userAPI } from '../../services/api';
import ViewProblems from './ViewProblems';
import ProblemManagement from './ProblemManagement';
import StudentManagement from './StudentManagement';
import Settings from './Settings';
import Contest from './Contest';
import SubmissionTracking from './SubmissionTracking'; 
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard'); // Track current view
    const [statistics, setStatistics] = useState({
        totalProblems: 0,
        totalStudents: 0,
        totalSubmissions: 0,
        successRate: 0,
        todaySubmissions: 0,
        activeStudents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const problemStats = await problemsAPI.getStatistics();
            const usersData = await userAPI.getAllUsers({ limit: 1 });
            
            setStatistics({
                totalProblems: problemStats.data?.totalProblems || 0,
                totalStudents: usersData.totalUsers || 0,
                totalSubmissions: problemStats.data?.submissions?.total || 0,
                successRate: parseFloat(problemStats.data?.submissions?.successRate || 0),
                todaySubmissions: Math.floor(Math.random() * 100), 
                activeStudents: Math.floor((usersData.totalUsers || 0) * 0.7) 
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBackToDashboard = () => {
        setActiveView('dashboard');
    };

    const handleNavigation = (view) => {
        setActiveView(view);
    };

    const dashboardCards = [
        {
            title: 'Problem Management',
            description: 'Create, edit, and organize coding challenges',
            icon: HiOutlineClipboardList,
            action: () => handleNavigation('problems'),
            color: 'from-violet-500 to-purple-600',
            stats: `${statistics.totalProblems} Problems`
        },
        {
            title: 'Student Hub',
            description: 'Manage student accounts and track progress',
            icon: HiUserGroup,
            action: () => handleNavigation('students'),
            color: 'from-emerald-500 to-teal-600',
            stats: `${statistics.totalStudents} Students`
        },
        {
            title: 'Submission Analytics',
            description: 'Monitor and analyze code submissions',
            icon: HiChartBar,
            action: () => handleNavigation('submissions'),
            color: 'from-orange-500 to-red-600',
            stats: `${statistics.totalSubmissions} Submissions`
        },
        {
            title: 'System Settings',
            description: 'Configure platform preferences',
            icon: HiCog,
            action: () => handleNavigation('settings'),
            color: 'from-slate-500 to-gray-600',
            stats: 'Latest Config'
        },
        {
            title: 'Contest Management',
            description: 'Create and manage programming contests',
            icon: HiStar,
            action: () => handleNavigation('contests'),
            color: 'from-yellow-500 to-orange-600',
            stats: '3 Active'
        }
    ];

    // Render different views based on activeView state
    if (activeView === 'problems') {
        return <ProblemManagement onBack={handleBackToDashboard} />;
    }

    if (activeView === 'students') {
        return <StudentManagement onBack={handleBackToDashboard} />;
    }

    if (activeView === 'settings') {
        return <Settings onBack={handleBackToDashboard} />;
    }

    if (activeView === 'submissions') {
        return <SubmissionTracking onBack={handleBackToDashboard} />;
    }

    if (activeView === 'contests') {
        return <Contest onBack={handleBackToDashboard} />;

    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Main Dashboard View
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 px-8 py-6">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <HiSparkles className="text-2xl text-yellow-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Codify Admin
                            </h1>
                            <p className="text-gray-300 text-sm">Platform Control Center</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <HiLogout className="text-lg" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="px-8 py-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome Back, Administrator
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Manage your coding platform with powerful tools and insights. Monitor student progress, create challenges, and maintain the learning environment.
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                    {dashboardCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <div key={index} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                                <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 transform group-hover:-translate-y-2">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                                        <IconComponent className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{card.title}</h3>
                                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">{card.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full">
                                            {card.stats}
                                        </span>
                                        <button 
                                            onClick={card.action}
                                            className={`bg-gradient-to-r ${card.color} text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                                        >
                                            Access
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{statistics.totalProblems}</div>
                            <div className="text-gray-400 text-sm">Total Problems</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">{statistics.totalStudents}</div>
                            <div className="text-gray-400 text-sm">Registered Students</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">{statistics.totalSubmissions}</div>
                            <div className="text-gray-400 text-sm">Total Submissions</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">{statistics.successRate}%</div>
                            <div className="text-gray-400 text-sm">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* ViewProblems Component */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <ViewProblems onDataUpdate={fetchDashboardData} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
