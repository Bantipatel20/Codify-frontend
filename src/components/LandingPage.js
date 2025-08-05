// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-400 to-purple-500">
            <nav className="flex justify-between w-full p-4 bg-white shadow-lg rounded-md">
                <div className="text-2xl font-bold text-blue-600">HackForge</div>
                <div>
                    <Link to="/login" className="text-blue-500 hover:text-blue-700 transition duration-300">Login</Link>
                </div>
            </nav>
            <div className="text-center mt-10">
                <h1 className="text-5xl font-extrabold text-white">Sharpen Your Coding Skills with HackForge</h1>
                <p className="mt-4 text-lg text-white opacity-90">Practice DSA Monitor performance. Get placed.</p>
                <Link to="/login" className="mt-6 inline-block px-8 py-3 bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-200 transition duration-300">
                    Get Started
                </Link>
            </div>
            <footer className="mt-auto p-4 bg-white shadow-lg w-full text-center rounded-md">
                <p className="text-gray-600">© 2025 HackForge. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
