// src/components/admin/Settings.js
import React, { useState, useEffect } from 'react';
import { HiCog, HiUser, HiKey, HiSave, HiArrowLeft, HiUsers, HiSearch, HiPencil, HiX } from 'react-icons/hi';
import { userAPI } from '../../services/api';

const Settings = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'students'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentFormData, setStudentFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Admin user ID
    const ADMIN_USER_ID = '68ad4516c3be4979ebac1d49';

    useEffect(() => {
        // Load current admin data
        loadAdminData();
        // Load students data
        loadStudents();
    }, []);

    useEffect(() => {
        // Filter students based on search term
        if (searchTerm) {
            const filtered = students.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchTerm, students]);

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
const loadStudents = async () => {
    try {
        setStudentsLoading(true);
        const response = await userAPI.getAllUsers({ limit: 100 });
        
        console.log('API Response:', response); // Debug log to see the actual structure
        
        if (response.success) {
            // Check if users array exists and handle different response structures
            let usersArray = [];
            
            if (response.data && Array.isArray(response.data.users)) {
                usersArray = response.data.users;
            } else if (response.data && Array.isArray(response.data)) {
                usersArray = response.data;
            } else if (Array.isArray(response.users)) {
                usersArray = response.users;
            } else if (Array.isArray(response)) {
                usersArray = response;
            } else {
                console.error('Unexpected response structure:', response);
                setError('Unexpected response format from server');
                return;
            }

            // Filter out the admin user from the students list
            const studentsData = usersArray
                .filter(user => user._id !== ADMIN_USER_ID) // Exclude admin user
                .map(user => ({
                    _id: user._id,
                    name: user.name || 'Unknown',
                    email: user.email || 'No email',
                    username: user.username || 'No username',
                    student_id: user.student_id || 'N/A',
                    department: user.department || 'Not specified',
                    batch: user.batch || 'N/A'
                }));
            
            setStudents(studentsData);
            setFilteredStudents(studentsData);
        } else {
            console.error('API request failed:', response);
            setError(response.error || 'Failed to load students data');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        
        // More specific error handling
        if (error.response) {
            setError(`Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
        } else if (error.request) {
            setError('Network error: Unable to reach server');
        } else {
            setError(`Error: ${error.message || 'Unknown error occurred'}`);
        }
    } finally {
        setStudentsLoading(false);
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

    const handleStudentInputChange = (field, value) => {
        setStudentFormData(prev => ({
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

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setStudentFormData({
            username: student.username,
            password: '',
            confirmPassword: ''
        });
        setMessage('');
        setError('');
    };

    const handleCancelEditStudent = () => {
        setEditingStudent(null);
        setStudentFormData({
            username: '',
            password: '',
            confirmPassword: ''
        });
        setMessage('');
        setError('');
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validation
        if (!studentFormData.username.trim()) {
            setError('Username is required');
            setLoading(false);
            return;
        }

        if (studentFormData.password && studentFormData.password !== studentFormData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (studentFormData.password && studentFormData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            // Prepare update data
            const updateData = {
                username: studentFormData.username.trim()
            };

            // Only include password if it's being changed
            if (studentFormData.password) {
                updateData.password = studentFormData.password;
            }

            console.log('Updating student with data:', updateData);

            const response = await userAPI.updateUser(editingStudent._id, updateData);

            if (response.success) {
                setMessage(`Student ${editingStudent.name}'s credentials updated successfully!`);
                
                // Reload students data
                await loadStudents();
                
                // Clear form and close edit mode
                handleCancelEditStudent();
            } else {
                setError(response.error || 'Failed to update student credentials');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            setError('Network error. Please try again.');
        }

        setLoading(false);
    };

    const tabs = [
        { id: 'admin', name: 'Admin Settings', icon: HiCog },
        { id: 'students', name: 'Student Credentials', icon: HiUsers }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                {onBack && (
                    <div className="mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-lg"
                            title="Back to Admin Dashboard"
                        >
                            <HiArrowLeft className="text-xl" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl mb-6">
                        <HiCog className="text-3xl text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Admin Settings</h1>
                    <p className="text-gray-300 text-xl">Manage admin and student credentials</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                <IconComponent className="text-lg" />
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Admin Settings Tab */}
                {activeTab === 'admin' && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                        <div className="flex items-center space-x-3 mb-8">
                            <HiUser className="text-2xl text-blue-400" />
                            <h2 className="text-2xl font-bold text-white">Admin Account Settings</h2>
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

                    </div>
                )}

                {/* Student Credentials Tab */}
                {activeTab === 'students' && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <HiUsers className="text-2xl text-purple-400" />
                                <h2 className="text-2xl font-bold text-white">Student Credential Management</h2>
                            </div>
                            <div className="text-sm text-gray-400">
                                {filteredStudents.length} of {students.length} students
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students by name, email, username, or student ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Edit Student Form Modal */}
                        {editingStudent && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-white">Edit Student Credentials</h3>
                                        <button 
                                            onClick={handleCancelEditStudent}
                                            className="text-gray-400 hover:text-white text-2xl"
                                        >
                                            <HiX />
                                        </button>
                                    </div>

                                    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <p className="text-blue-400 text-sm">
                                            <strong>Student:</strong> {editingStudent.name}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            <strong>ID:</strong> {editingStudent.student_id} • <strong>Email:</strong> {editingStudent.email}
                                        </p>
                                    </div>

                                    <form onSubmit={handleUpdateStudent} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Username
                                            </label>
                                            <input 
                                                type="text" 
                                                value={studentFormData.username}
                                                onChange={(e) => handleStudentInputChange('username', e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                                placeholder="Enter new username"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                New Password (optional)
                                            </label>
                                            <input 
                                                type="password" 
                                                value={studentFormData.password}
                                                onChange={(e) => handleStudentInputChange('password', e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                                placeholder="Enter new password (leave blank to keep current)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input 
                                                type="password" 
                                                value={studentFormData.confirmPassword}
                                                onChange={(e) => handleStudentInputChange('confirmPassword', e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <p className="text-gray-400 text-sm">
                                            Password must be at least 6 characters long. Leave blank to keep current password.
                                        </p>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={handleCancelEditStudent}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-2 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
                                            >
                                                <HiSave className="text-sm" />
                                                <span>{loading ? 'Updating...' : 'Update Credentials'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {message && (
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                                <p className="text-green-400 text-center">{message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                                <p className="text-red-400 text-center">{error}</p>
                            </div>
                        )}

                        {/* Students List */}
                        <div className="bg-gray-800/30 rounded-xl border border-gray-600 overflow-hidden">
                            {studentsLoading ? (
                                <div className="text-center p-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                    <p className="text-white text-lg">Loading students...</p>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center p-12">
                                    <div className="text-gray-400 text-4xl mb-4">👥</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
                                    <p className="text-gray-400">
                                        {searchTerm ? 'No students match your search criteria.' : 'No students available.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-600">
                                    {filteredStudents.map((student) => (
                                        <div key={student._id} className="p-6 hover:bg-gray-700/30 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-2">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold">
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-white">{student.name}</h4>
                                                            <p className="text-gray-400 text-sm">
                                                                ID: {student.student_id} • {student.department} • Batch: {student.batch}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-14">
                                                        <p className="text-gray-300 text-sm">
                                                            <strong>Email:</strong> {student.email}
                                                        </p>
                                                        <p className="text-gray-300 text-sm">
                                                            <strong>Username:</strong> {student.username}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleEditStudent(student)}
                                                    className="flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
                                                    title="Edit student credentials"
                                                >
                                                    <HiPencil className="text-sm" />
                                                    <span className="text-sm font-medium">Edit Credentials</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
