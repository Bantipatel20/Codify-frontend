// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { HiCode, HiChartBar, HiUsers, HiStar } from 'react-icons/hi';

const LandingPage = () => {
    const features = [
        {
            icon: HiCode,
            title: 'Practice Coding',
            description: 'Solve challenging problems and improve your programming skills'
        },
        {
            icon: HiChartBar,
            title: 'Track Progress',
            description: 'Monitor your performance and identify areas for improvement'
        },
        {
            icon: HiUsers,
            title: 'Compete',
            description: 'Join contests and compete with fellow developers'
        },
        {
            icon: HiStar,
            title: 'Get Placed',
            description: 'Prepare for technical interviews and land your dream job'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* Navigation */}
            <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <HiCode className="text-white text-xl" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                HackForge
                            </span>
                        </div>
                        <Link 
                            to="/login" 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center">
                        <h1 className="text-6xl md:text-7xl font-bold mb-8">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Sharpen Your
                            </span>
                            <br />
                            <span className="text-white">Coding Skills</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Master Data Structures & Algorithms, track your performance, and get ready for your dream job with 
                            <span className="text-blue-400 font-semibold"> HackForge</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                            <Link 
                                to="/login" 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                            >
                                🚀 Start Your Journey
                            </Link>
                            <div className="flex items-center space-x-4 text-gray-300">
                                <div className="flex -space-x-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-gray-900"></div>
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-gray-900"></div>
                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-gray-900"></div>
                                </div>
                                <span className="text-sm">Join 1000+ coders</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                                <div className="text-gray-300">Coding Problems</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                <div className="text-3xl font-bold text-green-400 mb-2">1000+</div>
                                <div className="text-gray-300">Active Students</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                                <div className="text-gray-300">Placement Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Why Choose <span className="text-blue-400">HackForge?</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Everything you need to excel in competitive programming and technical interviews
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="group">
                                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform group-hover:-translate-y-2">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <IconComponent className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                                        <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Level Up Your Coding?
                    </h2>
                    <p className="text-xl text-gray-300 mb-12">
                        Join thousands of developers who are already improving their skills with HackForge
                    </p>
                    <Link 
                        to="/login" 
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                        <span>Get Started Today</span>
                        <span>→</span>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black/30 border-t border-white/10 py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <HiCode className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">HackForge</span>
                        </div>
                        <p className="text-gray-400">© 2025 HackForge. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
