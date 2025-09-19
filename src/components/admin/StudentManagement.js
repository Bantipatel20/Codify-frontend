// src/components/admin/StudentManagement.js
import React, { useState, useEffect } from 'react';
import { HiUserGroup, HiPlus, HiSearch, HiPencil, HiTrash, HiEye, HiX, HiArrowLeft, HiUpload, HiDownload } from 'react-icons/hi';
import { userAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const StudentManagement = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [divisionFilter, setDivisionFilter] = useState('All');
  
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
    department: '',
    batch: '',
    div: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Dropdown options
  const departments = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'AIML'];
  const batches = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
  const divisions = ['1', '2', '3', '4'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, departmentFilter, batchFilter, divisionFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({ limit: 1000 });
      
      if (response.success) {
        setStudents(response.data);
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

  const filterStudents = () => {
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

    // Department filter
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    // Batch filter
    if (batchFilter !== 'All') {
      filtered = filtered.filter(student => student.batch === batchFilter);
    }

    // Division filter
    if (divisionFilter !== 'All') {
      filtered = filtered.filter(student => student.div === divisionFilter);
    }

    setFilteredStudents(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      student_id: '',
      department: '',
      batch: '',
      div: ''
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
      department: student.department,
      batch: student.batch,
      div: student.div
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
      let response;
      if (showAddModal) {
        response = await userAPI.createUser(formData);
      } else {
        const updateData = { ...formData };
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
      alert(`Failed to ${showAddModal ? 'add' : 'update'} student`);
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
            department: row.Department || row.department,
            batch: row.Batch || row.batch,
            div: String(row.Division || row.div || row.Div)
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
    // Create sample data with the correct format
    const templateData = [
      {
        'Name': 'Banti Patel',
        'Email': '23cs058@charusat.edu.in',
        'Username': '23cs058',
        'Password': '201005',
        'Student ID': '23CS058',
        'Department': 'CSE',
        'Batch': 'C1',
        'Division': '1'
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
      { wch: 12 }, // Department
      { wch: 10 }, // Batch
      { wch: 10 }  // Division
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `student_upload_template_${currentDate}.xlsx`;

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
      'Department': student.department,
      'Batch': student.batch,
      'Division': student.div,
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
      { wch: 12 }, // Department
      { wch: 10 }, // Batch
      { wch: 10 }, // Division
      { wch: 15 }  // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Data');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `students_data_${currentDate}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('All');
    setBatchFilter('All');
    setDivisionFilter('All');
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
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
              <option key={div} value={div}>{div}</option>
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
          {formLoading ? 'Saving...' : showAddModal ? 'Add Student' : 'Update Student'}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading students...</p>
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
            
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <HiUserGroup className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Student Management</h1>
              <p className="text-gray-400">Manage student accounts and information</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Download Template"
              >
                <HiDownload className="text-lg" />
                <span>Template</span>
              </button>
              
              <button
                onClick={handleDownloadStudentData}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Download Student Data"
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
              <span className="font-medium">Add Student</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Filter Students</h3>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">&nbsp;</label>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Students ({filteredStudents.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Batch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Division</th>
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
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {student.department}
                      </span>
                    </td>
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
              <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
              <p className="text-gray-400">
                {students.length === 0 ? 'No students have been added yet.' : 'No students match your current filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {renderModal(showAddModal, () => setShowAddModal(false), 'Add New Student', renderStudentForm())}

        {/* Edit Student Modal */}
        {renderModal(showEditModal, () => setShowEditModal(false), 'Edit Student', renderStudentForm())}

        {/* View Student Modal */}
        {renderModal(
          showViewModal,
          () => setShowViewModal(false),
          'Student Details',
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {selectedStudent.department}
                  </span>
                </div>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Created At</label>
                <p className="text-white">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
