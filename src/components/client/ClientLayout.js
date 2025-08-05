// src/components/client/ClientLayout.js
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HiHome, HiCode, HiDocumentText, HiChartBar, HiUser, HiLogout, HiSparkles } from 'react-icons/hi';

const ClientLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/client/dashboard', label: 'Dashboard', icon: HiHome },
        { path: '/client/practice', label: 'Practice', icon: HiCode },
        { path: '/client/submissions', label: 'Submissions', icon: HiDocumentText },
        { path: '/client/performance', label: 'Performance', icon: HiChartBar },
        { path: '/client/profile', label: 'Profile', icon: HiUser },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Top Navigation Bar */}
            <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                <HiSparkles className="text-xl text-yellow-300" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    HackForge
                                </span>
                                <p className="text-xs text-gray-300">Student Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-300">Welcome back!</p>
                                <p className="text-xs text-gray-400">Keep coding strong 💪</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <HiLogout className="text-sm" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Side Navigation */}
                <div className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
                    <nav className="mt-8 px-4">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:scale-105'
                                    }`}
                                >
                                    <IconComponent className={`text-xl mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info Card */}
                    <div className="absolute bottom-8 left-4 right-4">
                        <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-4 border border-gray-600">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <HiUser className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Student</p>
                                    <p className="text-xs text-gray-300">Active Learner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-gray-900">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ClientLayout;
