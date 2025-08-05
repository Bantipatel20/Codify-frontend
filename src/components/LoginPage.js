// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCode, HiUser, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

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

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        const validCredentials = {
            admin: { username: 'admin', password: 'admin123' },
            client: { username: 'user', password: 'user123' }
        };

        if (username === validCredentials.admin.username && password === validCredentials.admin.password) {
            const mockToken = btoa(JSON.stringify({ role: 'admin', username }));
            localStorage.setItem('token', mockToken);
            navigate('/admin/dashboard');
        } else if (username === validCredentials.client.username && password === validCredentials.client.password) {
            const mockToken = btoa(JSON.stringify({ role: 'client', username }));
            localStorage.setItem('token', mockToken);
            navigate('/client/dashboard');
        } else {
            setError('Invalid username or password');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                        <HiCode className="text-2xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to continue your coding journey</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                        )}

                        {/* Login Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
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

                        {/* Forgot Password */}
                        <div className="text-center">
                            <button 
                                type="button"
                                onClick={() => alert("Forgot Password functionality not implemented yet")}
                                className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-300"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-8 pt-6 border-t border-gray-600">
                        <p className="text-center text-gray-400 text-sm mb-4">Demo Credentials:</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-blue-400 font-medium mb-1">Admin</p>
                                <p className="text-gray-300">admin / admin123</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-green-400 font-medium mb-1">Student</p>
                                <p className="text-gray-300">user / user123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
