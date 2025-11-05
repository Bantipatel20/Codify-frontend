// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCode, HiUser, HiLockClosed, HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi';
import { authAPI } from '../services/api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('🔄 Attempting login with authAPI...');
            
            // Send credentials as-is, backend will handle case-insensitive matching
            const response = await authAPI.login({
                username: username.trim(),
                password: password
            });

            console.log('✅ Login response:', response);

            if (response.success) {
                // Store user information based on the updated user schema
                localStorage.setItem('currentUser', username);
                localStorage.setItem('userId', response.userId);
                
                const userData = {
                    _id: response.userId,
                    name: response.name,
                    email: response.email,
                    username: response.username,
                    role: response.role, // Now comes from database (Admin/Student)
                    department: response.department,
                    semester: response.semester,
                    division: response.division, // Updated field name
                    batch: response.batch,
                    student_id: response.student_id
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', btoa(JSON.stringify(userData)));
                
                console.log('🔍 User role from response:', response.role);
                console.log('🔍 User data:', userData);
                
                // Navigate based on role from database (not hardcoded user ID)
                if (response.role === 'admin' || userData.role === 'Admin') {
                    console.log('✅ Navigating to admin dashboard');
                    navigate('/admin/dashboard');
                } else {
                    console.log('✅ Navigating to client dashboard');
                    navigate('/client/practice');
                }
            } else {
                setError(response.error || response.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Handle different types of errors
            let errorMessage = 'An unexpected error occurred. Please try again.';
            
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const errorData = error.response.data;
                
                switch (status) {
                    case 400:
                        errorMessage = 'Please enter both username and password.';
                        break;
                    case 401:
                        errorMessage = 'Invalid username or password. Please check your credentials and try again.';
                        break;
                    case 404:
                        errorMessage = 'User not found. Please check your username and try again.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later or contact support.';
                        break;
                    default:
                        errorMessage = errorData?.error || errorData?.message || `Server error (${status}). Please try again.`;
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Cannot connect to server. Please check your internet connection and ensure the server is running.';
            } else if (error.message) {
                // Other errors
                if (error.message.includes('timeout')) {
                    errorMessage = 'Request timed out. Please check your connection and try again.';
                } else if (error.message.includes('Network Error')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            // Handle specific API error formats
            if (error.error) {
                errorMessage = error.error;
            } else if (error.message && !error.response && !error.request) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        }
        
        setIsLoading(false);
    };

    // Clear error when user starts typing
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                        <HiCode className="text-2xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to continue your coding journey</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className={`w-full bg-gray-800/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                                        error 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-600 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full bg-gray-800/50 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                                        error 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-600 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                                >
                                    {showPassword ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <HiExclamationCircle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-400 text-sm font-medium">Login Failed</p>
                                        <p className="text-red-300 text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading || !username.trim() || !password}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
