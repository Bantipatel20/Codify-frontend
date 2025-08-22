import React, { useState, useEffect } from 'react';
import { HiUserAdd, HiUpload, HiUsers, HiEye, HiTrash, HiPencil } from 'react-icons/hi';
import * as XLSX from 'xlsx';
import { userAPI } from '../../services/api';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '', 
        email: '', 
        username: '', 
        password: '',
        student_id: '',
        department: '',
        batch: '',
        div: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await userAPI.getAllUsers();
            setStudents(data.users || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. Please try again later.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userAPI.createUser(newStudent);
            await fetchStudents();
            setNewStudent({
                name: '', 
                email: '', 
                username: '', 
                password: '',
                student_id: '',
                department: '',
                batch: '',
                div: ''
            });
            setShowAddForm(false);
            alert('Student added successfully!');
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Failed to add student. Please try again.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Upload each student from Excel
                for (const student of jsonData) {
                    await userAPI.createUser(student);
                }

                // Refresh the student list after bulk upload
                fetchStudents();
                alert('Students imported successfully!');
            } catch (error) {
                console.error('Error importing students:', error);
                alert('Failed to import students. Please check your Excel file and try again.');
            }
        };

        reader.readAsBinaryString(file);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500/20';
            case 'inactive':
                return 'bg-red-500/20';
            case 'pending':
                return 'bg-yellow-500/20';
            default:
                return 'bg-gray-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                        <HiUsers className="text-2xl text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Student Management Hub</h1>
                    <p className="text-gray-300 text-lg">Manage student accounts and track their progress</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        <HiUserAdd className="text-lg" />
                        <span className="font-medium">Add Student</span>
                    </button>
                    
                    <label className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        <HiUpload className="text-lg" />
                        <span className="font-medium">Upload Excel</span>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Add Student Form */}
                {showAddForm && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <HiUserAdd className="mr-3 text-emerald-400" />
                            Add New Student
                        </h2>
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Student ID</label>
                                <input
                                    type="text"
                                    name="student_id"
                                    value={newStudent.student_id}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter student ID"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newStudent.name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter student name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newStudent.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newStudent.username}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newStudent.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={newStudent.department}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter department"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
                                <input
                                    type="text"
                                    name="batch"
                                    value={newStudent.batch}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter batch year"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Division</label>
                                <input
                                    type="text"
                                    name="div"
                                    value={newStudent.div}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter division"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end space-x-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Students Table */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/20">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <HiEye className="mr-3 text-blue-400" />
                            Student Directory ({students.length} students)
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center p-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                <p className="text-white mt-4">Loading students...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center p-8">
                                <div className="text-red-400 text-xl mb-2">⚠️</div>
                                <p className="text-white">{error}</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-white">No students found. Add your first student using the form above.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student Details</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Department</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Batch & Division</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Progress</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {students.map((student) => (
                                        <tr key={student._id || student.id} className="hover:bg-white/5 transition-all duration-300">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{student.student_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-white font-medium">{student.name}</div>
                                                    <div className="text-gray-400 text-sm">{student.email}</div>
                                                    <div className="text-gray-400 text-sm">@{student.username}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-300">{student.department}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-white">Batch: {student.batch}</div>
                                                    <div className="text-gray-400">Div: {student.div}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-center">
                                                        <div className="text-white font-bold">{student.solved || 0}</div>
                                                        <div className="text-xs text-gray-400">Solved</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-white font-bold">{student.avgScore || 0}%</div>
                                                        <div className="text-xs text-gray-400">Avg Score</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(student.status || 'Active')}`}>
                                                    {student.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                                                        <HiPencil className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300">
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
