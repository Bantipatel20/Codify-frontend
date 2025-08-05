// src/components/ClientLayout.js
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ClientLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/client/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/client/practice', label: 'Practice', icon: '📝' },
        { path: '/client/submissions', label: 'Submissions', icon: '📥' },
        { path: '/client/performance', label: 'Performance', icon: '📈' },
        { path: '/client/profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-blue-600">HackForge</span>
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.href = '/login';
                                }}
                                className="ml-4 px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Side Navigation */}
            <div className="flex">
                <div className="w-64 bg-white h-screen shadow-lg">
                    <nav className="mt-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-300 ${
                                    location.pathname === item.path 
                                    ? 'bg-blue-200 text-blue-600 border-l-4 border-blue-600' 
                                    : ''
                                }`}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                <span className="text-md">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ClientLayout;
