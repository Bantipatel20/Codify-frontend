// src/components/admin/StudentManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { HiUserGroup, HiPlus, HiSearch, HiPencil, HiTrash, HiEye, HiX, HiArrowLeft, HiUpload, HiDownload } from 'react-icons/hi';
import { userAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const StudentManagement = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states (removed department filter since it's only CSE)
  const [batchFilter, setBatchFilter] = useState('All');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    student_id: '',
    department: 'CSE', // Fixed to CSE only
    batch: '',
    div: '',
    semester: '',
    role: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Updated dropdown options - removed departments array
  const batches = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const divisions = ['1', '2'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const roles = ['Admin', 'Student'];

  // Memoize filterStudents function to prevent unnecessary re-renders
  const filterStudents = useCallback(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Batch filter
    if (batchFilter !== 'All') {
      filtered = filtered.filter(student => student.batch === batchFilter);
    }

    // Division filter
    if (divisionFilter !== 'All') {
      filtered = filtered.filter(student => student.div === parseInt(divisionFilter));
    }

    // Semester filter
    if (semesterFilter !== 'All') {
      filtered = filtered.filter(student => student.semester === parseInt(semesterFilter));
    }

    // Role filter
    if (roleFilter !== 'All') {
      filtered = filtered.filter(student => student.role === roleFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, batchFilter, divisionFilter, semesterFilter, roleFilter]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [filterStudents]); // Now filterStudents is properly memoized

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Filter to only get CSE students
      const response = await userAPI.getAllUsers({ limit: 1000, department: 'CSE' });
      
      if (response.success) {
        // Double filter to ensure only CSE students
        const cseStudents = response.data.filter(student => student.department === 'CSE');
        setStudents(cseStudents);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      student_id: '',
      department: 'CSE', // Always CSE
      batch: '',
      div: '',
      semester: '',
      role: 'Student'
    });
  };

  const handleAddStudent = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      username: student.username,
      password: '', // Don't pre-fill password
      student_id: student.student_id,
      department: 'CSE', // Always CSE
      batch: student.batch,
      div: student.div?.toString() || '',
      semester: student.semester?.toString() || '',
      role: student.role || 'Student'
    });
    setShowEditModal(true);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Prepare form data with proper data types
      const submitData = {
        ...formData,
        department: 'CSE', // Force CSE
        div: parseInt(formData.div),
        semester: parseInt(formData.semester)
      };

      let response;
      if (showAddModal) {
        response = await userAPI.createUser(submitData);
      } else {
        const updateData = { ...submitData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        response = await userAPI.updateUser(selectedStudent._id, updateData);
      }

      if (response.success) {
        await fetchStudents();
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        alert(`Student ${showAddModal ? 'added' : 'updated'} successfully!`);
      } else {
        alert(response.error || `Failed to ${showAddModal ? 'add' : 'update'} student`);
      }
    } catch (err) {
      console.error('Error saving student:', err);
      alert(`Failed to ${showAddModal ? 'add' : 'update'} student: ${err.message || err.error || 'Unknown error'}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      return;
    }

    try {
      const response = await userAPI.deleteUser(student._id);
      if (response.success) {
        await fetchStudents();
        alert('Student deleted successfully!');
      } else {
        alert('Failed to delete student');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student');
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel data:', jsonData);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const studentData = {
            name: row.Name || row.name,
            email: row.Email || row.email,
            username: row.Username || row.username,
            password: row.Password || row.password || 'defaultPassword123',
            student_id: row['Student ID'] || row.student_id,
            department: 'CSE', // Force CSE
            batch: row.Batch || row.batch,
            div: parseInt(row.Division || row.div || row.Div) || 1,
            semester: parseInt(row.Semester || row.semester) || 1,
            role: row.Role || row.role || 'Student'
          };

          const response = await userAPI.createUser(studentData);
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to create student:', studentData, response.error);
          }
        } catch (err) {
          errorCount++;
          console.error('Error processing row:', row, err);
        }
      }

      await fetchStudents();
      alert(`Bulk upload completed!\nSuccessful: ${successCount}\nFailed: ${errorCount}`);
    } catch (err) {
      console.error('Error processing Excel file:', err);
      alert('Error processing Excel file');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleDownloadTemplate = () => {
    // Create sample data with CSE only
    const templateData = [
      {
        'Name': 'Banti Patel',
        'Email': '23cs058@charusat.edu.in',
        'Username': '23cs058',
        'Password': '201005',
        'Student ID': '23CS058',
        'Batch': 'C1',
        'Division': '1',
        'Semester': '5',
        'Role': 'Student'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Username
      { wch: 15 }, // Password
      { wch: 15 }, // Student ID
      { wch: 10 }, // Batch
      { wch: 10 }, // Division
      { wch: 10 }, // Semester
      { wch: 10 }  // Role
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CSE Students Template');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `cse_student_upload_template_${currentDate}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  const handleDownloadStudentData = () => {
    if (filteredStudents.length === 0) {
      alert('No students to export');
      return;
    }

    // Format student data for export
    const exportData = filteredStudents.map(student => ({
      'Name': student.name,
      'Email': student.email,
      'Username': student.username,
      'Student ID': student.student_id,
      'Batch': student.batch,
      'Division': student.div,
      'Semester': student.semester,
      'Role': student.role,
      'Created At': new Date(student.createdAt).toLocaleDateString()
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Username
      { wch: 15 }, // Student ID
      { wch: 10 }, // Batch
      { wch: 10 }, // Division
      { wch: 10 }, // Semester
      { wch: 10 }, // Role
      { wch: 15 }  // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CSE Students Data');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `cse_students_data_${currentDate}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setBatchFilter('All');
    setDivisionFilter('All');
    setSemesterFilter('All');
    setRoleFilter('All');
  };

  const renderModal = (isVisible, onClose, title, children) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
              <HiX />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  const renderStudentForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password {showEditModal && '(leave blank to keep current)'}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={showAddModal}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Student ID *</label>
          <input
            type="text"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Department field - hidden but always CSE */}
      <input type="hidden" value="CSE" />
      
      {/* Display CSE as read-only info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">CSE</span>
          </div>
          <div>
            <p className="text-blue-400 font-medium">Computer Science & Engineering Department</p>
            <p className="text-blue-300 text-sm">All students will be added to CSE department</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Batch *</label>
          <select
            value={formData.batch}
            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Division *</label>
          <select
            value={formData.div}
            onChange={(e) => setFormData({ ...formData, div: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Division</option>
            {divisions.map(div => (
              <option key={div} value={div}>Division {div}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Semester *</label>
          <select
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Semester</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {formLoading ? 'Saving...' : showAddModal ? 'Add CSE Student' : 'Update Student'}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading CSE students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <HiArrowLeft className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </button>
            )}
            
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <HiUserGroup className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CSE Student Management</h1>
              <p className="text-gray-400">Manage Computer Science & Engineering students</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Download CSE Template"
              >
                <HiDownload className="text-lg" />
                <span>Template</span>
              </button>
              
              <button
                onClick={handleDownloadStudentData}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Download CSE Student Data"
              >
                <HiDownload className="text-lg" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBulkUpload}
                className="hidden"
                id="bulk-upload"
              />
              <label
                htmlFor="bulk-upload"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <HiUpload className="text-lg" />
                <span>Bulk Upload</span>
              </label>
            </div>
            
            <button
              onClick={handleAddStudent}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <HiPlus className="text-lg" />
              <span className="font-medium">Add CSE Student</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Filters - removed department filter */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Filter CSE Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Batches</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Division</label>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Divisions</option>
                {divisions.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-400">
              Showing {filteredStudents.length} of {students.length} CSE students
            </div>
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Students Table - removed department column */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">CSE Students ({filteredStudents.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Batch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Division</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Semester</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{student.name}</div>
                        <div className="text-sm text-gray-400">{student.email}</div>
                        <div className="text-xs text-gray-500">@{student.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                        {student.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                        Div {student.div}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-sm">
                        Sem {student.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        student.role === 'Admin' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {student.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="View Details"
                        >
                          <HiEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                          title="Edit Student"
                        >
                          <HiPencil className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Delete Student"
                        >
                          <HiTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <HiUserGroup className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No CSE Students Found</h3>
              <p className="text-gray-400">
                {students.length === 0 ? 'No CSE students have been added yet.' : 'No CSE students match your current filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {renderModal(showAddModal, () => setShowAddModal(false), 'Add New CSE Student', renderStudentForm())}

        {/* Edit Student Modal */}
        {renderModal(showEditModal, () => setShowEditModal(false), 'Edit CSE Student', renderStudentForm())}

        {/* View Student Modal - removed department display */}
        {renderModal(
          showViewModal,
          () => setShowViewModal(false),
          'CSE Student Details',
          selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <p className="text-white">{selectedStudent.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white">{selectedStudent.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                  <p className="text-white">{selectedStudent.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Student ID</label>
                  <p className="text-white">{selectedStudent.student_id}</p>
                </div>
              </div>
              
              {/* CSE Department Display */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">CSE</span>
                  </div>
                  <div>
                    <p className="text-blue-400 font-medium">Computer Science & Engineering</p>
                    <p className="text-blue-300 text-sm">Department</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedStudent.role === 'Admin' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedStudent.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Created At</label>
                  <p className="text-white">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Batch</label>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    {selectedStudent.batch}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Division</label>
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                    Division {selectedStudent.div}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Semester</label>
                  <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm">
                    Semester {selectedStudent.semester}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
