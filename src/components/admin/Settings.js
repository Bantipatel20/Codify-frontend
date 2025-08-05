// src/components/admin/Settings.js
import React, { useState } from 'react';
import { HiCog, HiKey, HiShieldCheck, HiBell, HiColorSwatch } from 'react-icons/hi';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('security');

    const tabs = [
        { id: 'security', name: 'Security', icon: HiShieldCheck },
        { id: 'notifications', name: 'Notifications', icon: HiBell },
        { id: 'appearance', name: 'Appearance', icon: HiColorSwatch },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl mb-6">
                        <HiCog className="text-3xl text-white animate-spin-slow" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">System Settings</h1>
                    <p className="text-gray-300 text-xl">Configure your platform preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                                activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <IconComponent className="text-xl" />
                                            <span className="font-medium">{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <HiKey className="text-2xl text-yellow-400" />
                                        <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                                    </div>

                                    {/* Change Password */}
                                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                                        <h3 className="text-lg font-semibold text-white mb-4">Change Admin Password</h3>
                                        <form className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Current Password
                                                </label>
                                                <input 
                                                    type="password" 
                                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    New Password
                                                </label>
                                                <input 
                                                    type="password" 
                                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <input 
                                                    type="password" 
                                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            <button 
                                                type="submit" 
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                            >
                                                Update Password
                                            </button>
                                        </form>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                                        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                                        <p className="text-gray-300 mb-4">Add an extra layer of security to your account</p>
                                        <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                            Enable 2FA
                                        </button>
                                    </div>

                                    {/* Session Management */}
                                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                                        <h3 className="text-lg font-semibold text-white mb-4">Session Management</h3>
                                        <p className="text-gray-300 mb-4">Manage your active sessions and login history</p>
                                        <div className="flex space-x-4">
                                            <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                                                View Sessions
                                            </button>
                                            <button className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                                                Logout All Devices
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <HiBell className="text-2xl text-blue-400" />
                                        <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { name: 'New student registrations', desc: 'Get notified when new students join the platform' },
                                            { name: 'Problem submissions', desc: 'Receive alerts for new code submissions' },
                                            { name: 'System maintenance alerts', desc: 'Important system updates and maintenance notices' },
                                            { name: 'Weekly progress reports', desc: 'Automated reports on student progress and platform usage' },
                                            { name: 'Security alerts', desc: 'Login attempts and security-related notifications' },
                                            { name: 'Performance metrics', desc: 'Daily performance and usage statistics' }
                                        ].map((notification, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-800/30 rounded-xl p-4 border border-gray-600">
                                                <div className="flex-1">
                                                    <span className="text-white font-medium block">{notification.name}</span>
                                                    <span className="text-gray-400 text-sm">{notification.desc}</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                                        <h3 className="text-lg font-semibold text-white mb-4">Email Settings</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Notification Email
                                                </label>
                                                <input 
                                                    type="email" 
                                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                                    placeholder="admin@hackforge.com"
                                                />
                                            </div>
                                            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                                                Update Email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <HiColorSwatch className="text-2xl text-pink-400" />
                                        <h2 className="text-2xl font-bold text-white">Appearance Settings</h2>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                                        <h3 className="text-lg font-semibold text-white mb-4">Theme Selection</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { name: 'Ocean Blue', colors: 'from-blue-900 to-indigo-900', active: true },
                                                { name: 'Purple Haze', colors: 'from-purple-900 to-pink-900', active: false },
                                                { name: 'Forest Green', colors: 'from-emerald-900 to-teal-900', active: false },
                                                { name: 'Sunset Orange', colors: 'from-orange-900 to-red-900', active: false }
                                            ].map((theme, index) => (
                                                <div key={index} className="cursor-pointer group">
                                                    <div className={`w-full h-24 bg-gradient-to-br ${theme.colors} rounded-xl border-2 transition-all duration-300 ${
                                                        theme.active ? 'border-white shadow-lg' : 'border-transparent group-hover:border-gray-400'
                                                    }`}>
                                                        {theme.active && (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-center text-white text-sm mt-2 font-medium">{theme.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                                        <h3 className="text-lg font-semibold text-white mb-4">Display Preferences</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-white font-medium">Compact Mode</span>
                                                    <p className="text-gray-400 text-sm">Reduce spacing and padding for more content</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-white font-medium">Dark Mode</span>
                                                    <p className="text-gray-400 text-sm">Use dark theme for better eye comfort</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
