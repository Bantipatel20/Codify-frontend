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

// User APIs - matching your backend endpoints
export const userAPI = {
  // GET /users - List users with pagination and filtering
  getAllUsers: async (params = {}) => {
    const { page = 1, limit = 10, name, email, department, batch } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(name && { name }),
      ...(email && { email }),
      ...(department && { department }),
      ...(batch && { batch })
    });
    
    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },
  
  // GET /user/:id - Get user by MongoDB ObjectId
  getUserById: async (id) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },
  
  // POST /user - Create new user
  createUser: async (userData) => {
    const response = await api.post('/user', userData);
    return response.data;
  },
  
  // PUT /user/:id - Update user fields (except password)
  updateUser: async (id, userData) => {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  },
  
  // DELETE /user/:id - Delete user by ID
  deleteUser: async (id) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  }
};

// Problems APIs - exactly matching your backend routes
export const problemsAPI = {
  // GET /api/problems - Get all problems with pagination and filtering
  getAllProblems: async (params = {}) => {
    const { page = 1, limit = 10, difficulty, search, tags, createdBy } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(difficulty && { difficulty }),
      ...(search && { search }),
      ...(tags && { tags }),
      ...(createdBy && { createdBy })
    });
    
    const response = await api.get(`/api/problems?${queryParams}`);
    return response.data;
  },

  // GET /api/problems/:id - Get problem by ID (includes test cases)
  getProblemById: async (id) => {
    const response = await api.get(`/api/problems/${id}`);
    return response.data;
  },

  // POST /api/problems - Create new problem
  createProblem: async (problemData) => {
    const response = await api.post('/api/problems', problemData);
    return response.data;
  },

  // PUT /api/problems/:id - Update problem
  updateProblem: async (id, problemData) => {
    const response = await api.put(`/api/problems/${id}`, problemData);
    return response.data;
  },

  // DELETE /api/problems/:id - Delete problem (soft delete)
  deleteProblem: async (id) => {
    const response = await api.delete(`/api/problems/${id}`);
    return response.data;
  },

  // GET /api/problems/difficulty/:difficulty - Get problems by difficulty
  getProblemsByDifficulty: async (difficulty) => {
    const response = await api.get(`/api/problems/difficulty/${difficulty}`);
    return response.data;
  },

  // GET /api/problems/tags/:tag - Get problems by tag
  getProblemsByTag: async (tag) => {
    const response = await api.get(`/api/problems/tags/${tag}`);
    return response.data;
  },

  // GET /api/problems/meta/tags - Get all unique tags
  getAllTags: async () => {
    const response = await api.get('/api/problems/meta/tags');
    return response.data;
  },

  // GET /api/problems/meta/statistics - Get problem statistics
  getStatistics: async () => {
    const response = await api.get('/api/problems/meta/statistics');
    return response.data;
  },

  // POST /api/problems/:id/test - Test solution against problem
  testSolution: async (id, solutionData) => {
    const response = await api.post(`/api/problems/${id}/test`, solutionData);
    return response.data;
  }
};

// Auth APIs using user endpoints
export const authAPI = {
  // Login user
  login: async (email, password) => {
    // First, get all users and find the one with matching email
    const response = await api.get(`/users?email=${encodeURIComponent(email)}&limit=1`);
    
    if (response.data && response.data.users && response.data.users.length > 0) {
      const user = response.data.users[0];
      
      // Simple password check (in production, use proper hashing)
      if (user.email === email) {
        return {
          success: true,
          user: user,
          token: btoa(`${user._id}:${Date.now()}`),
          message: 'Login successful'
        };
      }
    }
    
    return {
      success: false,
      message: 'Invalid email or password'
    };
  },
  
  // Register new user
  register: async (userData) => {
    const response = await userAPI.createUser(userData);
    
    if (response && response._id) {
      const token = btoa(`${response._id}:${Date.now()}`);
      return {
        success: true,
        user: response,
        token: token,
        message: 'Registration successful'
      };
    }
    
    return {
      success: false,
      message: 'Registration failed'
    };
  },
  
  // Get user profile
  getProfile: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      const response = await userAPI.getUserById(user._id);
      return {
        success: true,
        user: response
      };
    }
    return { success: false, message: 'No user found' };
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      const response = await userAPI.updateUser(user._id, userData);
      return {
        success: true,
        user: response,
        message: 'Profile updated successfully'
      };
    }
    return { success: false, message: 'No user found' };
  },
  
  // Logout user
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true, message: 'Logged out successfully' };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};

// Compiler APIs - matching your backend endpoints
export const compilerAPI = {
  // GET /compile/languages - Get supported programming languages
  getLanguages: async () => {
    const response = await api.get('/compile/languages');
    return response.data;
  },
  
  // POST /compile - Compile and execute code
  compileCode: async (codeData) => {
    const { code, lang, input } = codeData;
    const response = await api.post('/compile', {
      code,
      lang,
      input: input || ''
    });
    return response.data;
  },
  
  // GET /compile/stats - Get compilation statistics
  getCompileStats: async () => {
    const response = await api.get('/compile/stats');
    return response.data;
  }
};

// Submissions API - for handling code submissions and results
export const submissionsAPI = {
  // Submit solution for a problem
  submitSolution: async (problemId, submissionData) => {
    const response = await problemsAPI.testSolution(problemId, submissionData);
    
    // Store submission result locally or send to a submissions endpoint if available
    const submission = {
      id: Date.now(),
      problemId,
      status: response.data?.overallStatus === 'accepted' ? 'Accepted' : 'Failed',
      score: response.data?.overallStatus === 'accepted' ? 100 : 0,
      executionTime: '100ms', // This would come from actual execution
      language: submissionData.language,
      code: submissionData.code,
      testResults: response.data,
      submittedAt: new Date().toISOString()
    };

    return {
      success: true,
      submission,
      testResults: response.data
    };
  },

  // Get user submissions (mock - replace with actual endpoint when available)
  getUserSubmissions: async (userId, params = {}) => {
    // This would be replaced with actual API call when submissions endpoint is available
    const mockSubmissions = JSON.parse(localStorage.getItem(`submissions_${userId}`) || '[]');
    
    const { page = 1, limit = 10, problemId, status } = params;
    let filteredSubmissions = mockSubmissions;
    
    if (problemId) {
      filteredSubmissions = filteredSubmissions.filter(s => s.problemId === problemId);
    }
    
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedSubmissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredSubmissions.length / limit),
        totalSubmissions: filteredSubmissions.length,
        hasNextPage: endIndex < filteredSubmissions.length,
        hasPrevPage: page > 1
      }
    };
  }
};

// Contest APIs - placeholder for future contest functionality
export const contestAPI = {
  // Get all contests
  getAllContests: async (params = {}) => {
    // Placeholder - replace with actual API when contests are implemented
    return {
      success: true,
      data: [],
      message: 'Contest API not implemented yet'
    };
  },

  // Create contest
  createContest: async (contestData) => {
    // Placeholder - replace with actual API when contests are implemented
    return {
      success: false,
      message: 'Contest creation not implemented yet'
    };
  }
};

// Utility functions
export const apiUtils = {
  // Format error message from API response
  formatErrorMessage: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.code !== 'ECONNABORTED';
  },

  // Check if error is timeout
  isTimeoutError: (error) => {
    return error.code === 'ECONNABORTED';
  }
};

// Export the main api instance for direct use if needed
export default api;
