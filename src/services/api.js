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

// Mock User APIs - since your backend doesn't have user endpoints yet
export const userAPI = {
  // Mock implementation for dashboard statistics
  getAllUsers: async (params = {}) => {
    console.log('⚠️ Using mock user data - implement user endpoints on backend');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return consistent structure that matches what the dashboard expects
    return {
      success: true,
      data: {
        users: [], // Empty array of users
        totalUsers: 25, // Mock total users count
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
      // Also include at root level for backward compatibility
      users: [],
      totalUsers: 25,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  },
  
  // Mock other user methods
  getUserById: async (id) => {
    console.log('⚠️ Using mock user data - implement user endpoints on backend');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      data: {
        _id: id,
        name: 'Mock User',
        email: 'mock@example.com',
        role: 'student',
        department: 'Computer Science',
        batch: '2024'
      }
    };
  },
  
  createUser: async (userData) => {
    console.log('⚠️ Using mock user creation - implement user endpoints on backend');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        ...userData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
    };
  },
  
  updateUser: async (id, userData) => {
    console.log('⚠️ Using mock user update - implement user endpoints on backend');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        ...userData,
        _id: id,
        updatedAt: new Date().toISOString()
      }
    };
  },
  
  deleteUser: async (id) => {
    console.log('⚠️ Using mock user deletion - implement user endpoints on backend');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: 'User deleted successfully',
      data: { _id: id }
    };
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
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const user = {
          _id: username === 'admin' ? '68ad4516c3be4979ebac1d49' : Date.now().toString(),
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
  
  // Mock register
  register: async (userData) => {
    console.log('⚠️ Using mock register - implement auth endpoints on backend');
    
    const mockUser = {
      _id: Date.now().toString(),
      ...userData,
      role: 'student'
    };
    
    const token = btoa(JSON.stringify(mockUser));
    
    return {
      success: true,
      user: mockUser,
      token: token,
      message: 'Registration successful'
    };
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
  }
};

// Rest of your API exports remain the same...
export const compilerAPI = {
  getLanguages: async () => {
    console.log('⚠️ Compiler API not implemented yet');
    return {
      success: true,
      data: ['javascript', 'python', 'java', 'cpp']
    };
  },
  
  compileCode: async (codeData) => {
    console.log('⚠️ Compiler API not implemented yet');
    return {
      success: true,
      data: {
        output: 'Mock output',
        status: 'success'
      }
    };
  }
};

export const submissionsAPI = {
  submitSolution: async (problemId, submissionData) => {
    console.log('⚠️ Submissions API not implemented yet');
    return {
      success: true,
      data: {
        status: 'accepted',
        score: 100
      }
    };
  },
  
  getUserSubmissions: async (userId, params = {}) => {
    console.log('⚠️ Submissions API not implemented yet');
    return {
      success: true,
      data: [],
      pagination: {}
    };
  }
};

export const contestAPI = {
  getAllContests: async (params = {}) => {
    console.log('⚠️ Contest API not implemented yet');
    return {
      success: true,
      data: []
    };
  },
  
  createContest: async (contestData) => {
    console.log('⚠️ Contest API not implemented yet');
    return {
      success: false,
      message: 'Contest creation not implemented yet'
    };
  }
};

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
  }
};

export default api;
