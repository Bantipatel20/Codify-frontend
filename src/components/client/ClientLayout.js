// src/components/client/ClientLayout.js
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HiCode, HiDocumentText, HiLogout, HiSparkles, HiStar } from 'react-icons/hi';

const ClientLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/client/practice', label: 'Practice', icon: HiCode },
        { path: '/client/contests', label: 'Contests', icon: HiStar },
        { path: '/client/submissions', label: 'Submissions', icon: HiDocumentText },
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
                        {/* Logo Section */}
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                <HiSparkles className="text-xl text-yellow-300" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Codify
                                </span>
                                <p className="text-xs text-gray-300">Student Portal</p>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="flex items-center space-x-6">
                            {navItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 group ${
                                            isActive
                                                ? 'bg-white bg-opacity-20 text-white shadow-lg transform scale-105'
                                                : 'text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white hover:transform hover:scale-105'
                                        }`}
                                    >
                                        <IconComponent className={`text-lg mr-2 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                        <span className="font-medium">{item.label}</span>
                                        {isActive && (
                                            <div className="ml-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Section & Logout */}
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

            {/* Main Content Area */}
            <div className="bg-gray-900 min-h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default ClientLayout;
