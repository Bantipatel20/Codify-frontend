// src/services/api.js
import axios from 'axios';

// API Base URL - your backend runs on port 5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response || error.message);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Problems APIs - exactly matching your backend routes
export const problemsAPI = {
  // GET /api/problems - Get all problems with pagination and filtering
  getAllProblems: async (params = {}) => {
    try {
      const { page = 1, limit = 10, difficulty, search, tags, createdBy } = params;
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (difficulty) queryParams.append('difficulty', difficulty);
      if (search) queryParams.append('search', search);
      if (tags) queryParams.append('tags', tags);
      if (createdBy) queryParams.append('createdBy', createdBy);
      
      const response = await api.get(`/api/problems?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data || response.data.problems || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching problems:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/problems/:id - Get problem by ID
  getProblemById: async (id) => {
    try {
      const response = await api.get(`/api/problems/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // POST /api/problems - Create new problem
  createProblem: async (problemData) => {
    try {
      // Validate required fields before sending
      if (!problemData.title || !problemData.description) {
        throw new Error('Title and description are required');
      }
      
      if (!problemData.testCases || problemData.testCases.length === 0) {
        throw new Error('At least one test case is required');
      }
      
      // Validate test cases
      for (let i = 0; i < problemData.testCases.length; i++) {
        const testCase = problemData.testCases[i];
        if (!testCase.input || !testCase.output) {
          throw new Error(`Test case ${i + 1} must have both input and output`);
        }
      }
      
      // Ensure createdBy is a valid ObjectId string
      let finalProblemData = { ...problemData };
      
      if (!finalProblemData.createdBy) {
        // Use the admin ID as fallback
        finalProblemData.createdBy = '68ad4516c3be4979ebac1d49';
        console.log('⚠️ No createdBy provided, using admin ID as fallback');
      }
      
      // Ensure createdBy is a string, not an object
      if (typeof finalProblemData.createdBy === 'object') {
        finalProblemData.createdBy = '68ad4516c3be4979ebac1d49';
        console.log('⚠️ createdBy was an object, converted to admin ID string');
      }
      
      console.log('Creating problem with data:', finalProblemData);
      
      const response = await api.post('/api/problems', finalProblemData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Problem created successfully'
      };
      
    } catch (error) {
      console.error('Error creating problem:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message
      };
    }
  },

  // PUT /api/problems/:id - Update problem
  updateProblem: async (id, problemData) => {
    try {
      // Validate required fields
      if (!problemData.title || !problemData.description) {
        throw new Error('Title and description are required');
      }
      
      if (!problemData.testCases || problemData.testCases.length === 0) {
        throw new Error('At least one test case is required');
      }
      
      console.log('Updating problem with data:', problemData);
      
      const response = await api.put(`/api/problems/${id}`, problemData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Problem updated successfully'
      };
    } catch (error) {
      console.error('Error updating problem:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // DELETE /api/problems/:id - Delete problem
  deleteProblem: async (id) => {
    try {
      await api.delete(`/api/problems/${id}`);
      return {
        success: true,
        message: 'Problem deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // GET /api/problems/difficulty/:difficulty - Get problems by difficulty
  getProblemsByDifficulty: async (difficulty) => {
    try {
      const response = await api.get(`/api/problems/difficulty/${difficulty}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/problems/tags/:tag - Get problems by tag
  getProblemsByTag: async (tag) => {
    try {
      const response = await api.get(`/api/problems/tags/${tag}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/problems/meta/tags - Get all unique tags
  getAllTags: async () => {
    try {
      const response = await api.get('/api/problems/meta/tags');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/problems/meta/statistics - Get problem statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/problems/meta/statistics');
      return {
        success: true,
        data: response.data.data || response.data || {
          totalProblems: 0,
          submissions: {
            total: 0,
            successRate: 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Return mock statistics to prevent dashboard errors
      return {
        success: true,
        data: {
          totalProblems: 0,
          submissions: {
            total: 0,
            successRate: 0,
            today: 0
          }
        }
      };
    }
  },

  // POST /api/problems/:id/test - Test solution against problem
  testSolution: async (id, solutionData) => {
    try {
      const response = await api.post(`/api/problems/${id}/test`, solutionData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

// User APIs - Using your actual backend endpoints
export const userAPI = {
  // GET /users - Get all users with pagination and filtering
  getAllUsers: async (params = {}) => {
    try {
      const { page = 1, limit = 10, name, email } = params;
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (name) queryParams.append('name', name);
      if (email) queryParams.append('email', email);
      
      const response = await fetch(`http://localhost:5000/users?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: {
            users: data.data || [],
            totalUsers: data.pagination?.totalUsers || 0,
            pagination: data.pagination || {}
          },
          // Also include at root level for backward compatibility
          users: data.data || [],
          totalUsers: data.pagination?.totalUsers || 0,
          pagination: data.pagination || {}
        };
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.message,
        data: {
          users: [],
          totalUsers: 0,
          pagination: {}
        }
      };
    }
  },
  
  // GET /user/:id - Get user by ID
  getUserById: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        throw new Error(data.error || 'User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // POST /user - Create new user
  createUser: async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data,
          message: data.message
        };
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // PUT /user/:id - Update user
  updateUser: async (id, userData) => {
    try {
      console.log('Updating user:', id, 'with data:', userData);
      
      const response = await fetch(`http://localhost:5000/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data,
          message: data.message
        };
      } else {
        throw new Error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // DELETE /user/:id - Delete user
  deleteUser: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: data.message,
          data: data.data
        };
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Additional helper methods for admin settings
  updateAdminCredentials: async (adminId, credentials) => {
    try {
      return await userAPI.updateUser(adminId, credentials);
    } catch (error) {
      console.error('Error updating admin credentials:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getAdminUser: async (adminId) => {
    try {
      return await userAPI.getUserById(adminId);
    } catch (error) {
      console.error('Error fetching admin user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Helper function to get current user
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Auth APIs using your actual backend for login
export const authAPI = {
  // Real login using your backend
  login: async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const user = {
          _id: data.userId || (username === 'admin' ? '68ad4516c3be4979ebac1d49' : Date.now().toString()),
          name: data.name || username,
          email: `${username}@example.com`,
          username: username,
          role: data.role
        };
        
        const token = btoa(JSON.stringify(user));
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userId', user._id);
        
        return {
          success: true,
          user: user,
          token: token,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error during login'
      };
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      const response = await userAPI.createUser(userData);
      
      if (response.success) {
        const user = {
          ...response.data,
          role: 'student'
        };
        
        const token = btoa(JSON.stringify(user));
        
        return {
          success: true,
          user: user,
          token: token,
          message: 'Registration successful'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    return getCurrentUser();
  },
  
  // Set current user
  setCurrentUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
  },
  
  // Check authentication
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      // You might want to create a specific endpoint for password changes
      // For now, using the general update endpoint
      const response = await userAPI.updateUser(userId, {
        password: newPassword
      });
      
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Contest APIs - Using your actual backend endpoints
export const contestAPI = {
  // GET /api/contests - Get all contests with pagination and filtering
  getAllContests: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search, createdBy, startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (status) queryParams.append('status', status);
      if (search) queryParams.append('search', search);
      if (createdBy) queryParams.append('createdBy', createdBy);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await api.get(`/api/contests?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching contests:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/contests/:id - Get contest by ID
  getContestById: async (id) => {
    try {
      const response = await api.get(`/api/contests/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // POST /api/contests - Create new contest
  createContest: async (contestData) => {
    try {
      // Validate required fields before sending
      if (!contestData.title || !contestData.description) {
        throw new Error('Title and description are required');
      }
      
      if (!contestData.startDate || !contestData.endDate) {
        throw new Error('Start date and end date are required');
      }
      
      if (!contestData.problems || contestData.problems.length === 0) {
        throw new Error('At least one problem is required');
      }

      // Ensure createdBy is set
      let finalContestData = { ...contestData };
      
      if (!finalContestData.createdBy) {
        // Use the admin ID as fallback
        finalContestData.createdBy = '68ad4516c3be4979ebac1d49';
        console.log('⚠️ No createdBy provided, using admin ID as fallback');
      }
      
      console.log('Creating contest with data:', finalContestData);
      
      const response = await api.post('/api/contests', finalContestData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Contest created successfully'
      };
      
    } catch (error) {
      console.error('Error creating contest:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message
      };
    }
  },

  // PUT /api/contests/:id - Update contest
  updateContest: async (id, contestData) => {
    try {
      console.log('Updating contest with data:', contestData);
      
      const response = await api.put(`/api/contests/${id}`, contestData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Contest updated successfully'
      };
    } catch (error) {
      console.error('Error updating contest:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // DELETE /api/contests/:id - Delete contest
  deleteContest: async (id) => {
    try {
      await api.delete(`/api/contests/${id}`);
      return {
        success: true,
        message: 'Contest deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // POST /api/contests/:id/register - Register participant to contest
  registerParticipant: async (contestId, userId) => {
    try {
      const response = await api.post(`/api/contests/${contestId}/register`, { userId });
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Participant registered successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // GET /api/contests/:id/leaderboard - Get contest leaderboard
  getLeaderboard: async (contestId) => {
    try {
      const response = await api.get(`/api/contests/${contestId}/leaderboard`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // GET /api/contests/status/:status - Get contests by status
  getContestsByStatus: async (status) => {
    try {
      const response = await api.get(`/api/contests/status/${status}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/contests/filter/upcoming - Get upcoming contests
  getUpcomingContests: async () => {
    try {
      const response = await api.get('/api/contests/filter/upcoming');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // GET /api/contests/filter/active - Get active contests
  getActiveContests: async () => {
    try {
      const response = await api.get('/api/contests/filter/active');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // POST /api/contests/:id/status - Update contest status
  updateContestStatus: async (contestId, status) => {
    try {
      const response = await api.post(`/api/contests/${contestId}/status`, { status });
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Contest status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // GET /api/contests/:id/analytics - Get contest analytics
  getContestAnalytics: async (contestId) => {
    try {
      const response = await api.get(`/api/contests/${contestId}/analytics`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

// Compiler APIs
export const compilerAPI = {
  getLanguages: async () => {
    console.log('⚠️ Compiler API not implemented yet');
    return {
      success: true,
      data: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust']
    };
  },
  
  compileCode: async (codeData) => {
    console.log('⚠️ Compiler API not implemented yet');
    // Mock compilation result
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate compilation time
    
    return {
      success: true,
      data: {
        output: 'Hello World!\nProgram executed successfully.',
        status: 'success',
        executionTime: '0.05s',
        memoryUsed: '1.2MB'
      }
    };
  },
  
  runCode: async (codeData) => {
    console.log('⚠️ Code execution API not implemented yet');
    return {
      success: true,
      data: {
        output: 'Mock execution output',
        status: 'success',
        executionTime: '0.03s'
      }
    };
  }
};

// Submissions APIs
export const submissionsAPI = {
  submitSolution: async (problemId, submissionData) => {
    console.log('⚠️ Submissions API not implemented yet');
    // Mock submission result
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate judging time
    
    return {
      success: true,
      data: {
        submissionId: Date.now().toString(),
        status: 'accepted',
        score: 100,
        testCasesPassed: 5,
        totalTestCases: 5,
        executionTime: '0.12s',
        memoryUsed: '2.1MB'
      }
    };
  },
  
  getUserSubmissions: async (userId, params = {}) => {
    console.log('⚠️ Submissions API not implemented yet');
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  },
  
  getSubmissionById: async (submissionId) => {
    console.log('⚠️ Submissions API not implemented yet');
    return {
      success: true,
      data: {
        id: submissionId,
        status: 'accepted',
        code: '// Mock code',
        language: 'javascript'
      }
    };
  }
};

// API Utilities
export const apiUtils = {
  formatErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  isNetworkError: (error) => {
    return !error.response && error.code !== 'ECONNABORTED';
  },

  isTimeoutError: (error) => {
    return error.code === 'ECONNABORTED';
  },

  // Helper to build query parameters
  buildQueryParams: (params) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key].toString());
      }
    });
    
    return queryParams.toString();
  },

  // Helper to validate ObjectId format
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  // Helper to handle API responses consistently
  handleApiResponse: (response, defaultErrorMessage = 'Operation failed') => {
    if (response.success) {
      return response;
    } else {
      throw new Error(response.error || defaultErrorMessage);
    }
  }
};

// Constants
export const API_CONSTANTS = {
  ADMIN_USER_ID: '68ad4516c3be4979ebac1d49',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  REQUEST_TIMEOUT: 30000,
  SUPPORTED_LANGUAGES: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust'],
  PROBLEM_DIFFICULTIES: ['Easy', 'Medium', 'Hard'],
  USER_ROLES: ['admin', 'student', 'client'],
  CONTEST_STATUSES: ['Upcoming', 'Active', 'Completed', 'Cancelled'],
  DEPARTMENTS: ['AIML', 'CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
  BATCHES: ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2', 'A3', 'B3', 'C3', 'D3', 'A4', 'B4', 'C4', 'D4']
};

export default api;
