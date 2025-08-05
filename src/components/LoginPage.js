// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState(''); // State for username input
    const [password, setPassword] = useState(''); // State for password input
    const [error, setError] = useState(''); // State for error message
    const navigate = useNavigate(); // Hook to programmatically navigate

    const handleLogin = (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Reset error message

        // Static credentials for testing
        const validCredentials = {
            admin: { username: 'admin', password: 'admin123' },
            client: { username: 'user', password: 'user123' }
        };

        // Check if credentials match admin
        if (username === validCredentials.admin.username && password === validCredentials.admin.password) {
            const mockToken = btoa(JSON.stringify({ role: 'admin', username })); // Create mock token
            localStorage.setItem('token', mockToken); // Store token in local storage
            navigate('/admin/dashboard'); // Redirect to admin dashboard
            return;
        }

        // Check if credentials match client
        if (username === validCredentials.client.username && password === validCredentials.client.password) {
            const mockToken = btoa(JSON.stringify({ role: 'client', username })); // Create mock token
            localStorage.setItem('token', mockToken); // Store token in local storage
            navigate('/client/dashboard'); // Redirect to client dashboard
            return;
        }

        // If no match found, set error message
        setError('Invalid username or password');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-400 to-purple-500">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <div className="mb-4">
                    <label className="block mb-1 text-sm text-gray-600" htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Update username state
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 text-sm text-gray-600" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Update password state
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>} {/* Display error message */}
                <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">Login</button>
                <p className="mt-4 text-center">
                    <button onClick={() => alert("Forgot Password functionality not implemented yet")} className="text-blue-500 hover:underline">
                        Forgot Password?
                    </button>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
