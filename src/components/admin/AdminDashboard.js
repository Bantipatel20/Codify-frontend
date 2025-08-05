// src/components/admin/AdminDashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineClipboardList, HiUserGroup, HiChartBar, HiCog, HiLogout, HiSparkles, HiStar } from 'react-icons/hi';
import ViewProblems from './ViewProblems';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const dashboardCards = [
        {
            title: 'Problem Management',
            description: 'Create, edit, and organize coding challenges',
            icon: HiOutlineClipboardList,
            link: '/admin/problems',
            color: 'from-violet-500 to-purple-600',
            stats: '24 Problems'
        },
        {
            title: 'Student Hub',
            description: 'Manage student accounts and track progress',
            icon: HiUserGroup,
            link: '/admin/students',
            color: 'from-emerald-500 to-teal-600',
            stats: '156 Students'
        },
        {
            title: 'Submission Analytics',
            description: 'Monitor and analyze code submissions',
            icon: HiChartBar,
            link: '/admin/submissions',
            color: 'from-orange-500 to-red-600',
            stats: '1,247 Submissions'
        },
        {
            title: 'System Settings',
            description: 'Configure platform preferences',
            icon: HiCog,
            link: '/admin/settings',
            color: 'from-slate-500 to-gray-600',
            stats: 'Latest Config'
        },

{
    title: 'Contest Management',
    description: 'Create and manage programming contests',
    icon: HiStar,
    link: '/admin/contests',
    color: 'from-yellow-500 to-orange-600',
    stats: '3 Active'
}

    ];

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
                                HackForge Admin
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
            <div className="px-8 py-8 max-w-7xl mx- ">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome Back, Administrator
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Manage your coding platform with powerful tools and insights. Monitor student progress, create challenges, and maintain the learning environment.
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                    {dashboardCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <div key={index} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}>
                                </div>
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
                                        <Link 
                                            to={card.link} 
                                            className={`bg-gradient-to-r ${card.color} text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                                        >
                                            Access
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Active Students</p>
                                <p className="text-2xl font-bold text-green-400">142</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                <HiUserGroup className="text-green-400 text-xl" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Today's Submissions</p>
                                <p className="text-2xl font-bold text-blue-400">67</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                <HiChartBar className="text-blue-400 text-xl" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                                <p className="text-2xl font-bold text-yellow-400">78%</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                <HiSparkles className="text-yellow-400 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ViewProblems Component */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <ViewProblems />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
