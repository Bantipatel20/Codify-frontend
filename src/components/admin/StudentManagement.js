// src/components/admin/StudentManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { HiUserAdd, HiUpload, HiDownload, HiUsers, HiEye, HiTrash, HiPencil, HiSearch, HiRefresh, HiArrowLeft, HiX, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import * as XLSX from 'xlsx';
import { userAPI } from '../../services/api';

// Excel Upload Component
const ExcelUpload = ({ onStudentsUploaded, existingStudents }) => {
    const [showFormatGuide, setShowFormatGuide] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Sample data for template
    const sampleData = [
        {
            name: "Banti",
            email: "23cs050@charusat.edu.in",
            username: "23cs050",
            password: "23cs050123",
            student_id: "23cs050",
            department: "cse",
            batch: "c1",
            div: "1"
        },
       
        
    ];

    const downloadSampleExcel = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(sampleData);
            
            // Set column widths
            const colWidths = [
                { wch: 20 }, // name
                { wch: 25 }, // email
                { wch: 15 }, // username
                { wch: 15 }, // password
                { wch: 12 }, // student_id
                { wch: 20 }, // department
                { wch: 10 }, // batch
                { wch: 8 }   // div
            ];
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Students");
            XLSX.writeFile(wb, "student_upload_template.xlsx");
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Failed to download template. Please try again.');
        }
    };

    const validateStudentData = (jsonData) => {
        const validStudents = [];
        const errors = [];

        jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because index starts at 0 and we have header row
            
            // Get values with multiple possible column names
            const name = row.name || row.Name || row.NAME;
            const email = row.email || row.Email || row.EMAIL;
            const student_id = row.student_id || row['Student ID'] || row.StudentId || row.STUDENT_ID;
            const username = row.username || row.Username || row.USERNAME;
            const password = row.password || row.Password || row.PASSWORD;
            const department = row.department || row.Department || row.DEPARTMENT;
            const batch = row.batch || row.Batch || row.BATCH || row.year || row.Year;
            const div = row.div || row.Division || row.Section || row.DIV || row.DIVISION || row.SECTION;

            // Check required fields
            if (!name || !email || !student_id) {
                errors.push({
                    row: rowNumber,
                    error: 'Missing required fields (name, email, student_id)',
                    data: { name, email, student_id }
                });
                return;
            }

            // Validate name
            if (name.length < 2) {
                errors.push({
                    row: rowNumber,
                    error: 'Name must be at least 2 characters long',
                    data: { name }
                });
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push({
                    row: rowNumber,
                    error: 'Invalid email format',
                    data: { email }
                });
                return;
            }

            // Student ID validation
            if (student_id.length < 3) {
                errors.push({
                    row: rowNumber,
                    error: 'Student ID must be at least 3 characters long',
                    data: { student_id }
                });
                return;
            }

            // Check for duplicate student_id in current batch
            if (validStudents.some(s => s.student_id === student_id)) {
                errors.push({
                    row: rowNumber,
                    error: 'Duplicate student ID in upload file',
                    data: { student_id }
                });
                return;
            }

            // Check if student already exists
            if (existingStudents.some(s => s.student_id === student_id)) {
                errors.push({
                    row: rowNumber,
                    error: 'Student with this ID already exists in database',
                    data: { student_id }
                });
                return;
            }

            if (existingStudents.some(s => s.email === email)) {
                errors.push({
                    row: rowNumber,
                    error: 'Student with this email already exists in database',
                    data: { email }
                });
                return;
            }

            // Generate username if not provided
            const finalUsername = username || email.split('@')[0];
            
            // Check username uniqueness
            if (existingStudents.some(s => s.username === finalUsername) || 
                validStudents.some(s => s.username === finalUsername)) {
                errors.push({
                    row: rowNumber,
                    error: 'Username already exists or would be duplicate',
                    data: { username: finalUsername }
                });
                return;
            }

            validStudents.push({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                username: finalUsername.trim(),
                password: password || 'defaultPassword123',
                student_id: student_id.trim(),
                department: department || 'Not specified',
                batch: batch || new Date().getFullYear().toString(),
                div: div || 'A',
                status: 'Active',
                solved: 0,
                avgScore: 0
            });
        });

        return { validStudents, errors };
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid Excel file (.xlsx or .xls)');
            e.target.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        setUploadResults(null);

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                if (jsonData.length === 0) {
                    alert('The Excel file appears to be empty. Please check your file.');
                    setIsUploading(false);
                    return;
                }

                // Validate data
                const { validStudents, errors } = validateStudentData(jsonData);

                if (errors.length > 0 && validStudents.length === 0) {
                    setUploadResults({
                        success: false,
                        message: 'No valid students found in the file.',
                        errors,
                        validCount: 0,
                        errorCount: errors.length
                    });
                    setIsUploading(false);
                    return;
                }

                if (errors.length > 0) {
                    const continueUpload = window.confirm(
                        `Found ${errors.length} error(s) and ${validStudents.length} valid student(s).\n\nDo you want to continue uploading the valid students?`
                    );
                    if (!continueUpload) {
                        setIsUploading(false);
                        return;
                    }
                }

                // Upload students
                let successCount = 0;
                let uploadErrors = [];

                for (let i = 0; i < validStudents.length; i++) {
                    const student = validStudents[i];
                    try {
                        await userAPI.createUser(student);
                        successCount++;
                    } catch (error) {
                        console.error('Error creating student:', student, error);
                        uploadErrors.push({
                            student: `${student.name} (${student.student_id})`,
                            error: error.message || 'Unknown error'
                        });
                    }
                }

                // Set results
                setUploadResults({
                    success: successCount > 0,
                    message: `Upload completed: ${successCount} students added successfully`,
                    errors: [...errors, ...uploadErrors.map(e => ({ error: e.error, data: { student: e.student } }))],
                    validCount: successCount,
                    errorCount: errors.length + uploadErrors.length,
                    totalProcessed: jsonData.length
                });

                // Notify parent component
                if (successCount > 0 && onStudentsUploaded) {
                    onStudentsUploaded();
                }

            } catch (error) {
                console.error('Error processing Excel file:', error);
                setUploadResults({
                    success: false,
                    message: 'Failed to process Excel file. Please check the format and try again.',
                    errors: [{ error: error.message, data: {} }],
                    validCount: 0,
                    errorCount: 1
                });
            }
            
            setIsUploading(false);
        };

        reader.readAsBinaryString(file);
        // Reset file input
        e.target.value = '';
    };

    return (
        <div>
            {/* Upload Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <HiUpload className={`text-lg ${isUploading ? 'animate-pulse' : ''}`} />
                    <span className="font-medium">
                        {isUploading ? 'Uploading...' : 'Upload Excel'}
                    </span>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>

                <button 
                    onClick={downloadSampleExcel}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    <HiDownload className="text-lg" />
                    <span className="font-medium">Download Template</span>
                </button>

                <button 
                    onClick={() => setShowFormatGuide(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    <HiEye className="text-lg" />
                    <span className="font-medium">Format Guide</span>
                </button>
            </div>

            {/* Upload Results */}
            {uploadResults && (
                <div className="mt-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            {uploadResults.success ? (
                                <HiCheckCircle className="text-2xl text-green-400" />
                            ) : (
                                <HiExclamation className="text-2xl text-yellow-400" />
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-white">Upload Results</h3>
                                <p className="text-gray-300">{uploadResults.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUploadResults(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            <HiX className="text-xl" />
                        </button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-blue-400">{uploadResults.totalProcessed || 0}</div>
                            <div className="text-sm text-gray-400">Total Rows</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-green-400">{uploadResults.validCount}</div>
                            <div className="text-sm text-gray-400">Successful</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-red-400">{uploadResults.errorCount}</div>
                            <div className="text-sm text-gray-400">Errors</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-yellow-400">
                                {uploadResults.totalProcessed ? Math.round((uploadResults.validCount / uploadResults.totalProcessed) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-400">Success Rate</div>
                        </div>
                    </div>

                    {/* Error Details */}
                    {uploadResults.errors && uploadResults.errors.length > 0 && (
                        <div>
                            <h4 className="text-white font-medium mb-3">Error Details:</h4>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {uploadResults.errors.slice(0, 10).map((error, index) => (
                                    <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        <div className="text-red-400 text-sm font-medium">
                                            {error.row ? `Row ${error.row}: ` : ''}{error.error}
                                        </div>
                                        {error.data && Object.keys(error.data).length > 0 && (
                                            <div className="text-gray-400 text-xs mt-1">
                                                Data: {JSON.stringify(error.data)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {uploadResults.errors.length > 10 && (
                                    <div className="text-gray-400 text-sm text-center py-2">
                                        ... and {uploadResults.errors.length - 10} more errors
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Format Guide Modal */}
            {showFormatGuide && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Excel Upload Format Guide</h3>
                            <button 
                                onClick={() => setShowFormatGuide(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                <HiX />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Required Columns */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Required Columns:</h4>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <div className="text-green-400 font-medium">✓ name * (required)</div>
                                            <div className="text-gray-400 text-xs">Student's full name</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-green-400 font-medium">✓ email * (required)</div>
                                            <div className="text-gray-400 text-xs">Valid email address</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-green-400 font-medium">✓ student_id * (required)</div>
                                            <div className="text-gray-400 text-xs">Unique student identifier</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Columns */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Optional Columns:</h4>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <div className="text-blue-400 font-medium">username</div>
                                            <div className="text-gray-400 text-xs">Auto-generated if empty</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-blue-400 font-medium">password</div>
                                            <div className="text-gray-400 text-xs">Default if not provided</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-blue-400 font-medium">department</div>
                                            <div className="text-gray-400 text-xs">Student's department</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-blue-400 font-medium">batch</div>
                                            <div className="text-gray-400 text-xs">Year/batch</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-blue-400 font-medium">div</div>
                                            <div className="text-gray-400 text-xs">Division/section</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Data Table */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Sample Data:</h4>
                                <div className="overflow-x-auto bg-gray-800/50 rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-600">
                                                {Object.keys(sampleData[0]).map(key => (
                                                    <th key={key} className="px-3 py-3 text-left text-gray-300 font-medium whitespace-nowrap">
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sampleData.map((row, index) => (
                                                <tr key={index} className="border-b border-gray-700">
                                                    {Object.values(row).map((value, i) => (
                                                        <td key={i} className="px-3 py-3 text-gray-300 whitespace-nowrap">
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Important Notes:</h4>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                    <ul className="text-gray-300 space-y-2 text-sm">
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            The first row must contain column headers
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            Name, email, and student_id are required for each student
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            Email addresses must be valid and unique
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            Student IDs must be unique across all students
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            If username is not provided, it will be generated from email
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            Default password will be used if not specified
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            Maximum file size: 5MB
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4 pt-4">
                                <button
                                    onClick={downloadSampleExcel}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                                >
                                    <HiDownload className="text-lg" />
                                    <span>Download Sample Template</span>
                                </button>
                                <button
                                    onClick={() => setShowFormatGuide(false)}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main StudentManagement Component
const StudentManagement = ({ onBack }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [editingStudent, setEditingStudent] = useState(null);
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

    // Memoize the filterStudents function to prevent unnecessary re-renders
    const filterStudents = useCallback(() => {
        let filtered = students;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filterBy !== 'all') {
            filtered = filtered.filter(student => {
                switch (filterBy) {
                    case 'active':
                        return student.status.toLowerCase() === 'active';
                    case 'inactive':
                        return student.status.toLowerCase() === 'inactive';
                    case 'high-performers':
                        return student.avgScore >= 80;
                    case 'needs-attention':
                        return student.avgScore < 50;
                    default:
                        return true;
                }
            });
        }

        setFilteredStudents(filtered);
    }, [students, searchTerm, filterBy]);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [filterStudents]);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await userAPI.getAllUsers();
            console.log('API Response:', response);
            
            // Handle different response structures
            let studentsData = [];
            if (response.data && response.data.users) {
                studentsData = response.data.users;
            } else if (response.data && Array.isArray(response.data)) {
                studentsData = response.data;
            } else if (Array.isArray(response)) {
                studentsData = response;
            }

            // Ensure each student has required fields with defaults
            const processedStudents = studentsData.map(student => ({
                _id: student._id || student.id || Math.random().toString(36).substr(2, 9),
                student_id: student.student_id || student.studentId || 'N/A',
                name: student.name || student.fullName || 'Unknown',
                email: student.email || 'No email provided',
                username: student.username || student.userName || 'No username',
                department: student.department || student.dept || 'Not specified',
                batch: student.batch || student.year || 'N/A',
                div: student.div || student.division || student.section || 'N/A',
                status: student.status || 'Active',
                solved: student.solved || student.problemsSolved || 0,
                avgScore: student.avgScore || student.averageScore || 0,
                createdAt: student.createdAt || student.created_at || new Date().toISOString(),
                lastActive: student.lastActive || student.last_active || 'Never'
            }));

            setStudents(processedStudents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. Please check your connection and try again.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const studentData = {
                ...newStudent,
                status: 'Active',
                solved: 0,
                avgScore: 0
            };

            if (editingStudent) {
                await userAPI.updateUser(editingStudent._id, studentData);
                alert('Student updated successfully!');
            } else {
                await userAPI.createUser(studentData);
                alert('Student added successfully!');
            }

            await fetchStudents();
            resetForm();
        } catch (error) {
            console.error('Error saving student:', error);
            alert(`Failed to ${editingStudent ? 'update' : 'add'} student. Please try again.`);
        }
        setLoading(false);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setNewStudent({
            name: student.name,
            email: student.email,
            username: student.username,
            password: '', // Don't populate password for security
            student_id: student.student_id,
            department: student.department,
            batch: student.batch,
            div: student.div
        });
        setShowAddForm(true);
    };

    const handleDelete = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                await userAPI.deleteUser(studentId);
                await fetchStudents();
                alert('Student deleted successfully!');
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student. Please try again.');
            }
        }
    };

    const resetForm = () => {
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
        setEditingStudent(null);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500/20 text-green-400';
            case 'inactive':
                return 'bg-red-500/20 text-red-400';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPerformanceColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === 'Never') return 'Never';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-7xl mx-auto">
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
                        <span className="font-medium">{editingStudent ? 'Edit Student' : 'Add Student'}</span>
                    </button>
                    
                    {/* Excel Upload Component */}
                    <ExcelUpload 
                        onStudentsUploaded={fetchStudents}
                        existingStudents={students}
                    />

                    <button 
                        onClick={fetchStudents}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                        <HiRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
                        <span className="font-medium">Refresh</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students by name, email, ID, or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                />
                            </div>
                        </div>
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            <option value="all">All Students</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                            <option value="high-performers">High Performers (80%+)</option>
                            <option value="needs-attention">Needs Attention (&lt;50%)</option>
                        </select>
                    </div>
                </div>

                {/* Add/Edit Student Form */}
                {showAddForm && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <HiUserAdd className="mr-3 text-emerald-400" />
                            {editingStudent ? 'Edit Student' : 'Add New Student'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Student ID *</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password {editingStudent ? '(leave blank to keep current)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newStudent.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    placeholder="Enter password"
                                    required={!editingStudent}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Batch *</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Division *</label>
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
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingStudent ? 'Update Student' : 'Add Student')}
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
                            Student Directory ({filteredStudents.length} of {students.length} students)
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center p-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                <p className="text-white text-lg">Loading students...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center p-12">
                                <div className="text-red-400 text-4xl mb-4">⚠️</div>
                                <p className="text-white text-lg mb-4">{error}</p>
                                <button 
                                    onClick={fetchStudents}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center p-12">
                                <div className="text-gray-400 text-4xl mb-4">👥</div>
                                <p className="text-white text-lg">
                                    {students.length === 0 
                                        ? "No students found. Add your first student using the form above." 
                                        : "No students match your current search criteria."
                                    }
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student Details</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Department</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Batch & Division</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Performance</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-white/5 transition-all duration-300">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{student.student_id}</div>
                                                <div className="text-gray-400 text-xs">
                                                    Joined: {formatDate(student.createdAt)}
                                                </div>
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
                                                        <div className="text-white font-bold">{student.solved}</div>
                                                        <div className="text-xs text-gray-400">Solved</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className={`font-bold ${getPerformanceColor(student.avgScore)}`}>
                                                            {student.avgScore}%
                                                        </div>
                                                        <div className="text-xs text-gray-400">Avg Score</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEdit(student)}
                                                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                                                        title="Edit student"
                                                    >
                                                        <HiPencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(student._id)}
                                                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                                                        title="Delete student"
                                                    >
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

                {/* Summary Statistics */}
                {students.length > 0 && (
                    <div className="grid md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{students.length}</div>
                                <div className="text-gray-300">Total Students</div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">
                                    {students.filter(s => s.status.toLowerCase() === 'active').length}
                                </div>
                                <div className="text-gray-300">Active Students</div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">
                                    {Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length) || 0}%
                                </div>
                                <div className="text-gray-300">Average Score</div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-400">
                                    {students.filter(s => s.avgScore >= 80).length}
                                </div>
                                <div className="text-gray-300">High Performers</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;
