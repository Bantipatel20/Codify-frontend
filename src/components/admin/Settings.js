// src/components/admin/Settings.js
import React, { useState, useEffect } from 'react';
import { HiCog, HiUser, HiKey, HiSave } from 'react-icons/hi';

const Settings = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Admin user ID
    const ADMIN_USER_ID = '68ad4516c3be4979ebac1d49';

    useEffect(() => {
        // Load current admin data
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/user/${ADMIN_USER_ID}`);
            const data = await response.json();
            
            if (data.success) {
                setFormData({
                    username: data.data.username || '',
                    password: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            setError('Failed to load admin data');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear messages when user starts typing
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validation
        if (!formData.username.trim()) {
            setError('Username is required');
            setLoading(false);
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            // Prepare update data
            const updateData = {
                username: formData.username.trim()
            };

            // Only include password if it's being changed
            if (formData.password) {
                updateData.password = formData.password;
            }

            console.log('Updating admin with data:', updateData);

            const response = await fetch(`http://localhost:5000/user/${ADMIN_USER_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Admin settings updated successfully!');
                
                // Update localStorage if username changed
                if (updateData.username !== localStorage.getItem('currentUser')) {
                    localStorage.setItem('currentUser', updateData.username);
                    
                    // Update user data in localStorage
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    userData.username = updateData.username;
                    localStorage.setItem('user', JSON.stringify(userData));
                }
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));
            } else {
                setError(data.error || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating admin settings:', error);
            setError('Network error. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl mb-6">
                        <HiCog className="text-3xl text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Admin Settings</h1>
                    <p className="text-gray-300 text-xl">Update your admin credentials</p>
                </div>

                {/* Settings Form */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                    <div className="flex items-center space-x-3 mb-8">
                        <HiUser className="text-2xl text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                <HiUser className="text-xl text-blue-400" />
                                <span>Username</span>
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Admin Username
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Enter admin username"
                                    required
                                />
                                <p className="text-gray-400 text-sm mt-2">
                                    This username will be used for login
                                </p>
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                <HiKey className="text-xl text-yellow-400" />
                                <span>Change Password</span>
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter new password (leave blank to keep current)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input 
                                        type="password" 
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Password must be at least 6 characters long. Leave blank to keep current password.
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        {message && (
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                                <p className="text-green-400 text-center">{message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                                <p className="text-red-400 text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <HiSave className="text-lg" />
                                <span>{loading ? 'Updating...' : 'Update Settings'}</span>
                            </button>
                        </div>
                    </form>

                    {/* Current Admin Info */}
                    <div className="mt-8 bg-gray-800/30 rounded-xl p-6 border border-gray-600">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Admin Information</h3>
                        <div className="space-y-2 text-gray-300">
                            <p><strong>Admin ID:</strong> {ADMIN_USER_ID}</p>
                            <p><strong>Current Username:</strong> {formData.username || 'Loading...'}</p>
                            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
