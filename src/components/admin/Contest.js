// src/components/admin/Contest.js
import React, { useState, useEffect, useCallback } from 'react';
import { HiStar, HiPlus, HiSearch, HiPencil, HiTrash, HiEye, HiX, HiArrowLeft, HiCalendar, HiClock, HiUsers, HiRefresh } from 'react-icons/hi';
import { contestAPI, problemsAPI, userAPI } from '../../services/api';

const Contest = ({ onBack }) => {
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: '',
    rules: '',
    maxParticipants: 100,
    problems: [],
    allowedLanguages: ['cpp'], // Default to C++ only
    participantSelection: 'manual',
    filterCriteria: {
      department: ['CSE'], // Default to CSE department only
      semester: [],
      division: [],
      batch: [],
      rollNumberType: 'all'
    },
    manualStudents: []
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [manualProblems, setManualProblems] = useState([]);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [currentManualProblem, setCurrentManualProblem] = useState({
    title: '',
    difficulty: 'Easy',
    category: 'General',
    points: 100,
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    explanation: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  });

  // Enhanced filtering state
  const [studentFilters, setStudentFilters] = useState({
    department: 'CSE', // Default to CSE department
    semester: 'All',
    division: 'All',
    batch: 'All',
    rollNumberType: 'All',
    search: ''
  });

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [previewStudents, setPreviewStudents] = useState([]);

  // Dropdown options
  const departments = ['CSE']; // Only CSE department
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const divisions = ['1', '2']; // Only Division 1 and 2 (stored as strings in DB)
  const batches = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];

  // Fetch functions (defined before useEffect to avoid dependency issues)
  const fetchContests = useCallback(async () => {
    try {
      const response = await contestAPI.getAllContests({ limit: 1000 });
      if (response.success) {
        setContests(response.data);
      } else {
        setError('Failed to fetch contests');
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to fetch contests');
    }
  }, []);

  const checkAndActivateContests = useCallback(async () => {
    try {
      const response = await contestAPI.getAllContests({ limit: 1000 });
      if (!response.success || !response.data) {
        return;
      }

      const now = new Date();
      const contestsToUpdate = [];
      const currentContests = response.data;

      currentContests.forEach(contest => {
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);

        // Activate contest if start time has passed and it's still Upcoming
        if (contest.status === 'Upcoming' && now >= startDate && now < endDate) {
          contestsToUpdate.push({
            contestId: contest._id,
            title: contest.title,
            newStatus: 'Active'
          });
        }
        // Complete contest if end time has passed and it's Active
        else if (contest.status === 'Active' && now >= endDate) {
          contestsToUpdate.push({
            contestId: contest._id,
            title: contest.title,
            newStatus: 'Completed'
          });
        }
      });

      // Update contests that need status change
      if (contestsToUpdate.length > 0) {
        console.log(`Auto-updating ${contestsToUpdate.length} contest(s)...`);
        
        for (const update of contestsToUpdate) {
          try {
            const statusResponse = await contestAPI.updateContestStatus(update.contestId, update.newStatus);
            if (statusResponse.success) {
              console.log(`✓ Contest "${update.title}" automatically updated to ${update.newStatus}`);
            }
          } catch (err) {
            console.error(`Failed to update contest ${update.contestId}:`, err);
          }
        }

        // Refresh contests list after updates
        await fetchContests();
      }
    } catch (err) {
      console.error('Error checking contest activation:', err);
    }
  }, [fetchContests]);

  const fetchProblems = useCallback(async () => {
    try {
      const response = await problemsAPI.getAllProblems({ limit: 1000 });
      if (response.success) {
        setProblems(response.data);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
  }, []);

  const fetchAllStudents = useCallback(async () => {
    try {
      const response = await userAPI.getAllUsers({ limit: 1000 });
      if (response.success) {
        setAllStudents(response.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchContests(),
        fetchProblems(),
        fetchAllStudents()
      ]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, [fetchContests, fetchProblems, fetchAllStudents]);

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  // Helper function to validate dates
  const validateDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // const now = new Date(); // Commented out - allowing past dates for editing existing contests

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date format';
    }

    if (start >= end) {
      return 'End date must be after start date';
    }

    // Allow past dates for editing existing contests
    // if (start < now) {
    //   return 'Start date cannot be in the past';
    // }

    return null;
  };

  // Helper function to check if roll number ends with even or odd digit
  const getRollNumberType = (studentId) => {
    if (!studentId) return null;
    const lastDigit = parseInt(studentId.slice(-1));
    if (isNaN(lastDigit)) return null;
    return lastDigit % 2 === 0 ? 'even' : 'odd';
  };

  // UseEffect hooks
  useEffect(() => {
    fetchInitialData();
    
    // Set up automatic contest activation check
    const interval = setInterval(() => {
      checkAndActivateContests();
    }, 60000); // Check every minute

    // Initial check
    checkAndActivateContests();

    return () => clearInterval(interval);
  }, [fetchInitialData, checkAndActivateContests]);

  useEffect(() => {
    filterContests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contests, searchTerm, statusFilter]);

  useEffect(() => {
    filterStudentsForSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStudents, studentFilters]);

  useEffect(() => {
    if (formData.participantSelection === 'automatic') {
      generatePreviewStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.filterCriteria, formData.participantSelection, allStudents]);

  const filterContests = () => {
    let filtered = contests;

    if (searchTerm) {
      filtered = filtered.filter(contest =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(contest => contest.status === statusFilter);
    }

    setFilteredContests(filtered);
  };

  const filterStudentsForSelection = () => {
    let filtered = [...allStudents];
    
    console.log('🔍 Filtering students with:', studentFilters);
    console.log('📊 Total students before filter:', filtered.length);

    if (studentFilters.department !== 'All') {
      filtered = filtered.filter(student => student.department === studentFilters.department);
      console.log(`✅ After department filter (${studentFilters.department}):`, filtered.length);
    }

    if (studentFilters.semester !== 'All') {
      filtered = filtered.filter(student => student.semester === parseInt(studentFilters.semester));
      console.log(`✅ After semester filter (${studentFilters.semester}):`, filtered.length);
    }

    if (studentFilters.division !== 'All') {
      const divisionValue = studentFilters.division; // Keep as string since div is stored as string "1" or "2"
      console.log(`🔢 Filtering by division: "${divisionValue}" (type: ${typeof divisionValue})`);
      
      // Log sample student divisions to debug
      if (filtered.length > 0) {
        console.log('Sample student div field:', filtered.slice(0, 5).map(s => ({
          name: s.name,
          div: s.div,
          divType: typeof s.div
        })));
      }
      
      filtered = filtered.filter(student => {
        // Use 'div' field which is stored as string "1" or "2"
        const studentDiv = student.div;
        const matches = studentDiv === divisionValue;
        if (!matches && filtered.length < 20) { // Only log for debugging when small list
          console.log(`❌ Student ${student.name} div "${studentDiv}" !== "${divisionValue}"`);
        }
        return matches;
      });
      console.log(`✅ After division filter ("${divisionValue}"):`, filtered.length);
    }

    if (studentFilters.batch !== 'All') {
      filtered = filtered.filter(student => student.batch === studentFilters.batch);
      console.log(`✅ After batch filter (${studentFilters.batch}):`, filtered.length);
    }

    // Roll number type filter (Even/Odd based on last digit)
    if (studentFilters.rollNumberType !== 'All') {
      filtered = filtered.filter(student => {
        const rollType = getRollNumberType(student.student_id);
        if (studentFilters.rollNumberType === 'Even') {
          return rollType === 'even';
        } else if (studentFilters.rollNumberType === 'Odd') {
          return rollType === 'odd';
        }
        return true;
      });
    }

    if (studentFilters.search.trim()) {
      const searchTerm = studentFilters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.student_id.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
      );
      console.log(`✅ After search filter ("${searchTerm}"):`, filtered.length);
    }

    console.log('🎯 Final filtered students:', filtered.length);
    setFilteredStudents(filtered);
  };

  const generatePreviewStudents = () => {
    let preview = [...allStudents];

    if (formData.filterCriteria.department.length > 0) {
      preview = preview.filter(student => formData.filterCriteria.department.includes(student.department));
    }

    if (formData.filterCriteria.semester.length > 0) {
      preview = preview.filter(student => formData.filterCriteria.semester.includes(student.semester));
    }

    if (formData.filterCriteria.division.length > 0) {
      preview = preview.filter(student => {
        return formData.filterCriteria.division.includes(student.div);
      });
    }

    if (formData.filterCriteria.batch.length > 0) {
      preview = preview.filter(student => formData.filterCriteria.batch.includes(student.batch));
    }

    // Roll number type filter for automatic selection
    if (formData.filterCriteria.rollNumberType !== 'all') {
      preview = preview.filter(student => {
        const rollType = getRollNumberType(student.student_id);
        if (formData.filterCriteria.rollNumberType === 'even') {
          return rollType === 'even';
        } else if (formData.filterCriteria.rollNumberType === 'odd') {
          return rollType === 'odd';
        }
        return true;
      });
    }

    setPreviewStudents(preview);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      duration: '',
      rules: '',
      maxParticipants: 100,
      problems: [],
      allowedLanguages: ['cpp'], // Default to C++ only
      participantSelection: 'manual',
      filterCriteria: {
        department: ['CSE'], // Default to CSE department only
        semester: [],
        division: [],
        batch: [],
        rollNumberType: 'all'
      },
      manualStudents: []
    });
    setManualProblems([]);
  };

  const handleCreateContest = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditContest = (contest) => {
    setSelectedContest(contest);
    setFormData({
      title: contest.title || '',
      description: contest.description || '',
      startDate: formatDateForInput(contest.startDate),
      endDate: formatDateForInput(contest.endDate),
      duration: contest.duration || '',
      rules: contest.rules || '',
      maxParticipants: contest.maxParticipants || 100,
      problems: contest.problems || [],
      allowedLanguages: contest.allowedLanguages || ['cpp'], // Default to C++ only
      participantSelection: contest.participantSelection || 'manual',
      filterCriteria: contest.filterCriteria || {
        department: [],
        semester: [],
        division: [],
        batch: [],
        rollNumberType: 'all'
      },
      manualStudents: contest.participants?.map(p => p.userId) || []
    });
    
    const manualProbs = contest.problems?.filter(p => p.problemId.startsWith('manual_')) || [];
    setManualProblems(manualProbs.map(p => ({
      ...p.manualProblem,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      points: p.points,
      problemId: p.problemId
    })));
    
    setShowEditModal(true);
  };

  const handleViewContest = (contest) => {
    setSelectedContest(contest);
    setShowViewModal(true);
  };

  const handleDeleteContest = async (contest) => {
    if (!window.confirm(`Are you sure you want to delete "${contest.title}"?`)) {
      return;
    }

    try {
      const response = await contestAPI.deleteContest(contest._id);
      if (response.success) {
        await fetchContests();
        alert('Contest deleted successfully!');
      } else {
        alert('Failed to delete contest');
      }
    } catch (err) {
      console.error('Error deleting contest:', err);
      alert('Failed to delete contest');
    }
  };

  // Updated handleSubmit function with proper date validation and formatting
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Contest title is required');
        return;
      }

      if (!formData.description.trim()) {
        alert('Contest description is required');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert('Start date and end date are required');
        return;
      }

      // Validate dates
      const dateValidationError = validateDates(formData.startDate, formData.endDate);
      if (dateValidationError) {
        alert(dateValidationError);
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        alert('User not found. Please refresh and try again.');
        return;
      }

      // Prepare problems array
      const allProblems = [
        ...formData.problems.filter(p => !p.problemId?.startsWith('manual_')),
        ...manualProblems.map((mp, index) => ({
          problemId: mp.problemId || `manual_${Date.now()}_${index}`,
          title: mp.title,
          difficulty: mp.difficulty,
          category: mp.category,
          points: mp.points,
          manualProblem: {
            description: mp.description,
            inputFormat: mp.inputFormat,
            outputFormat: mp.outputFormat,
            constraints: mp.constraints,
            sampleInput: mp.sampleInput,
            sampleOutput: mp.sampleOutput,
            explanation: mp.explanation,
            testCases: mp.testCases
          }
        }))
      ];

      // Clean and validate filter criteria
      const cleanFilterCriteria = {
        department: Array.isArray(formData.filterCriteria.department) 
          ? formData.filterCriteria.department.filter(d => d && d.trim() !== '') 
          : [],
        semester: Array.isArray(formData.filterCriteria.semester) 
          ? formData.filterCriteria.semester.filter(s => s !== null && s !== undefined && s !== '') 
          : [],
        division: Array.isArray(formData.filterCriteria.division) 
          ? formData.filterCriteria.division.filter(d => d !== null && d !== undefined && d !== '') 
          : [],
        batch: Array.isArray(formData.filterCriteria.batch) 
          ? formData.filterCriteria.batch.filter(b => b && b.trim() !== '') 
          : [],
        rollNumberType: formData.filterCriteria.rollNumberType || 'all'
      };

      // Create proper ISO date strings
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      // Validate dates again after conversion
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Invalid date format. Please check your date inputs.');
        return;
      }

      const contestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: formData.duration?.trim() || '',
        rules: formData.rules?.trim() || '',
        maxParticipants: parseInt(formData.maxParticipants) || 100,
        problems: allProblems,
        allowedLanguages: formData.allowedLanguages.length > 0 ? formData.allowedLanguages : null, // null means all languages allowed
        createdBy: currentUser._id,
        participantSelection: formData.participantSelection,
        filterCriteria: cleanFilterCriteria,
        settings: {
          allowLateSubmission: false,
          showLeaderboard: true,
          showLeaderboardDuringContest: true,
          freezeLeaderboard: false,
          freezeTime: 60,
          allowViewProblemsBeforeStart: false,
          penaltyPerWrongSubmission: 0
        }
      };

      // Add manual students only if manual selection
      if (formData.participantSelection === 'manual' && formData.manualStudents.length > 0) {
        contestData.manualStudents = formData.manualStudents;
      }

      console.log('Contest data being sent:', {
        ...contestData,
        startDate: contestData.startDate,
        endDate: contestData.endDate,
        problems: contestData.problems.length,
        filterCriteria: contestData.filterCriteria
      });

      let response;
      if (showEditModal) {
        response = await contestAPI.updateContest(selectedContest._id, contestData);
      } else {
        response = await contestAPI.createContest(contestData);
      }

      if (response.success) {
        // Register manual students if manual selection is used
        if (formData.participantSelection === 'manual' && formData.manualStudents.length > 0) {
          try {
            const contestId = showEditModal ? selectedContest._id : response.data._id;
            const registerResponse = await contestAPI.registerManualStudents(contestId, formData.manualStudents);
            
            if (registerResponse.success) {
              console.log(`✅ Registered ${formData.manualStudents.length} students to contest`);
            } else {
              console.error('Failed to register students:', registerResponse.error);
              alert(`Contest created but failed to register students: ${registerResponse.error}`);
            }
          } catch (regError) {
            console.error('Error registering students:', regError);
            alert(`Contest created but error registering students: ${regError.message}`);
          }
        }
        
        await fetchContests();
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
        alert(`Contest ${showEditModal ? 'updated' : 'created'} successfully!`);
      } else {
        console.error('Server response error:', response);
        alert(`Failed to ${showEditModal ? 'update' : 'create'} contest: ${response.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving contest:', err);
      
      // More detailed error handling
      let errorMessage = `Error ${showEditModal ? 'updating' : 'creating'} contest: `;
      
      if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkSelectStudents = (students) => {
    const studentIds = students.map(s => s._id);
    setFormData({
      ...formData,
      manualStudents: [...new Set([...formData.manualStudents, ...studentIds])]
    });
  };

  const handleBulkDeselectStudents = (students) => {
    if (!students || students.length === 0) {
      console.log('No students to deselect');
      return;
    }
    
    const studentIds = students.map(s => s._id);
    const currentlySelected = formData.manualStudents.filter(id => studentIds.includes(id));
    
    console.log(`Deselecting ${currentlySelected.length} students from ${studentIds.length} filtered students`);
    
    setFormData({
      ...formData,
      manualStudents: formData.manualStudents.filter(id => !studentIds.includes(id))
    });
  };

  const clearAllFilters = () => {
    setStudentFilters({
      department: 'CSE', // Reset to CSE department (not 'All')
      semester: 'All',
      division: 'All',
      batch: 'All',
      rollNumberType: 'All',
      search: ''
    });
  };

  const addManualProblem = () => {
    setCurrentManualProblem({
      title: '',
      difficulty: 'Easy',
      category: 'General',
      points: 100,
      description: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      sampleInput: '',
      sampleOutput: '',
      explanation: '',
      testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    });
    setShowProblemModal(true);
  };

  const editManualProblem = (problem, index) => {
    setCurrentManualProblem({ ...problem, index });
    setShowProblemModal(true);
  };

  const saveManualProblem = () => {
    if (!currentManualProblem.title.trim()) {
      alert('Problem title is required');
      return;
    }

    if (currentManualProblem.testCases.length === 0 || 
        currentManualProblem.testCases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim())) {
      alert('At least one complete test case is required');
      return;
    }

    const newProblems = [...manualProblems];
    if (currentManualProblem.index !== undefined) {
      newProblems[currentManualProblem.index] = { ...currentManualProblem };
      delete newProblems[currentManualProblem.index].index;
    } else {
      newProblems.push({ ...currentManualProblem });
    }

    setManualProblems(newProblems);
    setShowProblemModal(false);
  };

  const removeManualProblem = (index) => {
    const newProblems = manualProblems.filter((_, i) => i !== index);
    setManualProblems(newProblems);
  };

  const addTestCase = () => {
    setCurrentManualProblem({
      ...currentManualProblem,
      testCases: [...currentManualProblem.testCases, { input: '', expectedOutput: '', isHidden: false }]
    });
  };

  const removeTestCase = (index) => {
    if (currentManualProblem.testCases.length > 1) {
      const newTestCases = currentManualProblem.testCases.filter((_, i) => i !== index);
      setCurrentManualProblem({
        ...currentManualProblem,
        testCases: newTestCases
      });
    }
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...currentManualProblem.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setCurrentManualProblem({
      ...currentManualProblem,
      testCases: newTestCases
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const renderModal = (isVisible, onClose, title, children) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

  const renderParticipantSelection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">Participant Selection Method</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="participantSelection"
              value="manual"
              checked={formData.participantSelection === 'manual'}
              onChange={(e) => setFormData({ ...formData, participantSelection: e.target.value })}
              className="text-blue-500"
            />
            <div className="ml-3">
              <span className="text-white font-medium">Manual Selection</span>
              <p className="text-gray-400 text-sm">Manually select individual students</p>
            </div>
          </label>
          
          <label className="flex items-center p-4 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="participantSelection"
              value="automatic"
              checked={formData.participantSelection === 'automatic'}
              onChange={(e) => setFormData({ ...formData, participantSelection: e.target.value })}
              className="text-blue-500"
            />
            <div className="ml-3">
              <span className="text-white font-medium">Automatic Selection</span>
              <p className="text-gray-400 text-sm">Filter-based automatic selection</p>
            </div>
          </label>
        </div>
      </div>

      {/* Manual Selection */}
      {formData.participantSelection === 'manual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-white">Manual Student Selection</h4>
            <span className="text-gray-400">
              Selected: {formData.manualStudents.length} students
            </span>
          </div>

          {/* Student Filters */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-white font-medium">Filter Students</h5>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear Filters
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <select
                value={studentFilters.department}
                onChange={(e) => setStudentFilters({...studentFilters, department: e.target.value})}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={studentFilters.semester}
                onChange={(e) => setStudentFilters({...studentFilters, semester: e.target.value})}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="All">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>

              <select
                value={studentFilters.division}
                onChange={(e) => setStudentFilters({...studentFilters, division: e.target.value})}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="All">All Divisions</option>
                {divisions.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>

              <select
                value={studentFilters.batch}
                onChange={(e) => setStudentFilters({...studentFilters, batch: e.target.value})}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="All">All Batches</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>

              <select
                value={studentFilters.rollNumberType}
                onChange={(e) => setStudentFilters({...studentFilters, rollNumberType: e.target.value})}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="All">All Roll Types</option>
                <option value="Even">Even Roll Numbers</option>
                <option value="Odd">Odd Roll Numbers</option>
              </select>

              <input
                type="text"
                placeholder="Search students..."
                value={studentFilters.search}
                onChange={(e) => setStudentFilters({...studentFilters, search: e.target.value})}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-400"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleBulkSelectStudents(filteredStudents)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Select All Filtered ({filteredStudents.length})
              </button>
              <button
                type="button"
                onClick={() => handleBulkDeselectStudents(filteredStudents)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Deselect All Filtered ({filteredStudents.filter(s => formData.manualStudents.includes(s._id)).length})
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="max-h-96 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-3">
                Showing {filteredStudents.length} of {allStudents.length} students
              </div>
              
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No students match the current filters
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map(student => (
                    <label key={student._id} className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.manualStudents.includes(student._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              manualStudents: [...formData.manualStudents, student._id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              manualStudents: formData.manualStudents.filter(id => id !== student._id)
                            });
                          }
                        }}
                        className="text-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{student.name}</span>
                          <div className="flex space-x-2 text-xs">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              {student.department}
                            </span>
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              Sem {student.semester}
                            </span>
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                              Div {student.div}
                            </span>
                            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                              {student.batch}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              getRollNumberType(student.student_id) === 'even' 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'bg-pink-500/20 text-pink-400'
                            }`}>
                              {getRollNumberType(student.student_id) === 'even' ? 'Even' : 'Odd'}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {student.student_id} • {student.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Automatic Selection */}
      {formData.participantSelection === 'automatic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-white">Automatic Selection Criteria</h4>
            <span className="text-gray-400">
              Preview: {previewStudents.length} students will be selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Departments</label>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                {departments.map(dept => (
                  <label key={dept} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.filterCriteria.department.includes(dept)}
                      onChange={(e) => {
                        const newDepartments = e.target.checked
                          ? [...formData.filterCriteria.department, dept]
                          : formData.filterCriteria.department.filter(d => d !== dept);
                        setFormData({
                          ...formData,
                          filterCriteria: { ...formData.filterCriteria, department: newDepartments }
                        });
                      }}
                      className="text-blue-500"
                    />
                    <span className="ml-2 text-white text-sm">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Semesters</label>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                {semesters.map(sem => (
                  <label key={sem} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.filterCriteria.semester.includes(sem)}
                      onChange={(e) => {
                        const newSemesters = e.target.checked
                          ? [...formData.filterCriteria.semester, sem]
                          : formData.filterCriteria.semester.filter(s => s !== sem);
                        setFormData({
                          ...formData,
                          filterCriteria: { ...formData.filterCriteria, semester: newSemesters }
                        });
                      }}
                      className="text-blue-500"
                    />
                    <span className="ml-2 text-white text-sm">Semester {sem}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Division Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Divisions</label>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                {divisions.map(div => (
                  <label key={div} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.filterCriteria.division.includes(div)}
                      onChange={(e) => {
                        const newDivisions = e.target.checked
                          ? [...formData.filterCriteria.division, div]
                          : formData.filterCriteria.division.filter(d => d !== div);
                        setFormData({
                          ...formData,
                          filterCriteria: { ...formData.filterCriteria, division: newDivisions }
                        });
                      }}
                      className="text-blue-500"
                    />
                    <span className="ml-2 text-white text-sm">Division {div}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Batches</label>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                {batches.map(batch => (
                  <label key={batch} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.filterCriteria.batch.includes(batch)}
                      onChange={(e) => {
                        const newBatches = e.target.checked
                          ? [...formData.filterCriteria.batch, batch]
                          : formData.filterCriteria.batch.filter(b => b !== batch);
                        setFormData({
                          ...formData,
                          filterCriteria: { ...formData.filterCriteria, batch: newBatches }
                        });
                      }}
                      className="text-blue-500"
                    />
                    <span className="ml-2 text-white text-sm">{batch}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Roll Number Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number Type</label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rollNumberType"
                    value="all"
                    checked={formData.filterCriteria.rollNumberType === 'all'}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, rollNumberType: e.target.value }
                    })}
                    className="text-blue-500"
                  />
                  <span className="ml-2 text-white text-sm">All Roll Numbers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rollNumberType"
                    value="even"
                    checked={formData.filterCriteria.rollNumberType === 'even'}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, rollNumberType: e.target.value }
                    })}
                    className="text-blue-500"
                  />
                  <span className="ml-2 text-white text-sm">Even Roll Numbers (e.g., 058, 026)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rollNumberType"
                    value="odd"
                    checked={formData.filterCriteria.rollNumberType === 'odd'}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, rollNumberType: e.target.value }
                    })}
                    className="text-blue-500"
                  />
                  <span className="ml-2 text-white text-sm">Odd Roll Numbers (e.g., 057, 025)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Students */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-white font-medium">Preview Selected Students</h5>
              <span className="text-gray-400 text-sm">{previewStudents.length} students</span>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {previewStudents.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No students match the current criteria
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {previewStudents.slice(0, 20).map(student => (
                    <div key={student._id} className="flex items-center justify-between bg-gray-700 rounded p-2">
                      <div>
                        <span className="text-white text-sm font-medium">{student.name}</span>
                        <div className="text-xs text-gray-400">
                          {student.student_id} • {student.department} • Sem {student.semester} • Div {student.div} • {student.batch}
                          <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                            getRollNumberType(student.student_id) === 'even' 
                              ? 'bg-cyan-500/20 text-cyan-400' 
                              : 'bg-pink-500/20 text-pink-400'
                          }`}>
                            {getRollNumberType(student.student_id) === 'even' ? 'Even' : 'Odd'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {previewStudents.length > 20 && (
                    <div className="col-span-2 text-center text-gray-400 text-sm py-2">
                      ... and {previewStudents.length - 20} more students
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContestForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contest Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Allowed Programming Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Allowed Programming Languages</label>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'cpp', label: 'C++', icon: '⚡' },
              { value: 'c', label: 'C', icon: '🔷' },
              { value: 'python', label: 'Python', icon: '🐍' },
              { value: 'java', label: 'Java', icon: '☕' },
              { value: 'javascript', label: 'JavaScript', icon: '📜' },
              { value: 'go', label: 'Go', icon: '🔵' },
              { value: 'rust', label: 'Rust', icon: '🦀' },
              { value: 'ruby', label: 'Ruby', icon: '💎' }
            ].map((lang) => (
              <label key={lang.value} className="flex items-center p-3 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.allowedLanguages.includes(lang.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        allowedLanguages: [...formData.allowedLanguages, lang.value]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        allowedLanguages: formData.allowedLanguages.filter(l => l !== lang.value)
                      });
                    }
                  }}
                  className="text-blue-500"
                />
                <span className="ml-3 text-white text-sm font-medium">
                  {lang.icon} {lang.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Selected: {formData.allowedLanguages.length > 0 ? formData.allowedLanguages.map(l => 
              l.charAt(0).toUpperCase() + l.slice(1)
            ).join(', ') : 'None (All languages will be allowed)'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2h, 90m"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rules</label>
        <textarea
          value={formData.rules}
          onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Contest rules and guidelines..."
        />
      </div>

      {/* Participant Selection */}
      {renderParticipantSelection()}

      {/* Problems Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-300">Problems</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addManualProblem}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Add Manual Problem
            </button>
          </div>
        </div>

        {/* Existing Problems */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Database Problems</label>
          <div className="max-h-32 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg p-4">
            {problems.map(problem => (
              <label key={problem._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={formData.problems.some(p => p.problemId === problem._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        problems: [...formData.problems, {
                          problemId: problem._id,
                          title: problem.title,
                          difficulty: problem.difficulty,
                          category: 'General',
                          points: 100
                        }]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        problems: formData.problems.filter(p => p.problemId !== problem._id)
                      });
                    }
                  }}
                  className="text-blue-500"
                />
                <span className="ml-2 text-white text-sm">
                  {problem.title} ({problem.difficulty})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Manual Problems */}
        {manualProblems.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Manual Problems</label>
            <div className="space-y-2">
              {manualProblems.map((problem, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 border border-gray-600 rounded-lg p-3">
                  <div>
                    <span className="text-white font-medium">{problem.title}</span>
                    <span className="ml-2 text-gray-400">({problem.difficulty}) - {problem.points} pts</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => editManualProblem(problem, index)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <HiPencil />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeManualProblem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false);
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
          {formLoading ? 'Saving...' : showEditModal ? 'Update Contest' : 'Create Contest'}
        </button>
      </div>
    </form>
  );

  const renderManualProblemForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Problem Title *</label>
          <input
            type="text"
            value={currentManualProblem.title}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, title: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
          <input
            type="number"
            value={currentManualProblem.points}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, points: parseInt(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
          <select
            value={currentManualProblem.difficulty}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, difficulty: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <input
            type="text"
            value={currentManualProblem.category}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, category: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Problem Description *</label>
        <textarea
          value={currentManualProblem.description}
          onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, description: e.target.value })}
          rows={6}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the problem in detail..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Input Format</label>
          <textarea
            value={currentManualProblem.inputFormat}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, inputFormat: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the input format..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
          <textarea
            value={currentManualProblem.outputFormat}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, outputFormat: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the output format..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Constraints</label>
        <textarea
          value={currentManualProblem.constraints}
          onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, constraints: e.target.value })}
          rows={2}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 1 ≤ n ≤ 1000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sample Input</label>
          <textarea
            value={currentManualProblem.sampleInput}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, sampleInput: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sample Output</label>
          <textarea
            value={currentManualProblem.sampleOutput}
            onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, sampleOutput: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Explanation</label>
        <textarea
          value={currentManualProblem.explanation}
          onChange={(e) => setCurrentManualProblem({ ...currentManualProblem, explanation: e.target.value })}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Explain the sample test case..."
        />
      </div>

      {/* Test Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-300">Test Cases *</label>
          <button
            type="button"
            onClick={addTestCase}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Add Test Case
          </button>
        </div>

        <div className="space-y-4">
          {currentManualProblem.testCases.map((testCase, index) => (
            <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Test Case {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testCase.isHidden}
                      onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                      className="text-blue-500"
                    />
                    <span className="ml-2 text-gray-400 text-sm">Hidden</span>
                  </label>
                  {currentManualProblem.testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <HiTrash />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Input</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Expected Output</label>
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => setShowProblemModal(false)}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveManualProblem}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Save Problem
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading contests...</p>
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
            
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <HiStar className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Contest Management</h1>
              <p className="text-gray-400">Create and manage programming contests</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                checkAndActivateContests();
                alert('Checking for contests to activate...');
              }}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-colors"
              title="Check and activate contests based on start time"
            >
              <HiRefresh className="text-lg" />
              <span className="font-medium">Check Status</span>
            </button>
            <button
              onClick={handleCreateContest}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <HiPlus className="text-lg" />
              <span className="font-medium">Create Contest</span>
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
          <h3 className="text-lg font-semibold text-white mb-4">Filter Contests</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">&nbsp;</label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredContests.length} of {contests.length} contests
          </div>
        </div>

        {/* Contests Table */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Contests ({filteredContests.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contest</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Schedule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Participants</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problems</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredContests.map((contest) => (
                  <tr key={contest._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{contest.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-2">{contest.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contest.status)}`}>
                        {contest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center mb-1">
                          <HiCalendar className="mr-2 text-gray-400" />
                          {formatDate(contest.startDate)}
                        </div>
                        <div className="flex items-center">
                          <HiClock className="mr-2 text-gray-400" />
                          {contest.duration}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <HiUsers className="mr-2 text-gray-400" />
                        <span className="text-gray-300">
                          {contest.participants?.length || 0}/{contest.maxParticipants}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{contest.problems?.length || 0} problems</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewContest(contest)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="View Details"
                        >
                          <HiEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditContest(contest)}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                          title="Edit Contest"
                        >
                          <HiPencil className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteContest(contest)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Delete Contest"
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
          
          {filteredContests.length === 0 && (
            <div className="text-center py-12">
              <HiStar className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Contests Found</h3>
              <p className="text-gray-400">
                {contests.length === 0 ? 'No contests have been created yet.' : 'No contests match your current filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Create Contest Modal */}
        {renderModal(showCreateModal, () => setShowCreateModal(false), 'Create New Contest', renderContestForm())}

        {/* Edit Contest Modal */}
        {renderModal(showEditModal, () => setShowEditModal(false), 'Edit Contest', renderContestForm())}

        {/* View Contest Modal */}
        {renderModal(
          showViewModal,
          () => setShowViewModal(false),
          'Contest Details',
          selectedContest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <p className="text-white text-lg font-semibold">{selectedContest.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedContest.status)}`}>
                    {selectedContest.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <p className="text-white">{selectedContest.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Allowed Languages</label>
                <div className="flex flex-wrap gap-2">
                  {selectedContest.allowedLanguages && selectedContest.allowedLanguages.length > 0 ? (
                    selectedContest.allowedLanguages.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">All languages allowed</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <p className="text-white">{formatDate(selectedContest.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <p className="text-white">{formatDate(selectedContest.endDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                  <p className="text-white">{selectedContest.duration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Max Participants</label>
                  <p className="text-white">{selectedContest.maxParticipants}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Participants</label>
                  <p className="text-white">{selectedContest.participants?.length || 0}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Problems ({selectedContest.problems?.length || 0})</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedContest.problems?.map((problem, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{problem.title}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-gray-400 text-sm">{problem.points} pts</span>
                          {problem.problemId.startsWith('manual_') && (
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">Manual</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* Manual Problem Modal */}
        {renderModal(showProblemModal, () => setShowProblemModal(false), 'Manual Problem', renderManualProblemForm())}
      </div>
    </div>
  );
};

export default Contest;
