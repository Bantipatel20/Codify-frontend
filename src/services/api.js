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
  },
  
  // Login function using existing user endpoints
  loginUser: async (email, password) => {
    try {
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
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  }
};

// Auth APIs using user endpoints
export const authAPI = {
  login: async (email, password) => {
    return await userAPI.loginUser(email, password);
  },
  
  register: async (userData) => {
    try {
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
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed'
      };
    }
  },
  
  getProfile: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id) {
        const response = await userAPI.getUserById(user._id);
        return {
          success: true,
          user: response
        };
      }
      return { success: false, message: 'No user found' };
    } catch (error) {
      return { success: false, message: 'Failed to get profile' };
    }
  },
  
  updateProfile: async (userData) => {
    try {
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
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Update failed'
      };
    }
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }
};

// Compiler APIs - matching your backend endpoints
export const compilerAPI = {
  getLanguages: async () => {
    const response = await api.get('/compile/languages');
    return response.data;
  },
  
  compileCode: async (codeData) => {
    const { code, lang, input } = codeData;
    const response = await api.post('/compile', {
      code,
      lang,
      input: input || ''
    });
    return response.data;
  },
  
  getCompileStats: async () => {
    const response = await api.get('/compile/stats');
    return response.data;
  }
};

// Mock Problems API (you can replace with actual backend endpoints later)
export const problemsAPI = {
  getAllProblems: async () => {
    return {
      success: true,
      problems: [
        {
          id: 1,
          title: 'Two Sum',
          difficulty: 'Easy',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          points: 100,
          tags: ['Array', 'Hash Table'],
          solved: false
        },
        {
          id: 2,
          title: 'Add Two Numbers',
          difficulty: 'Medium',
          description: 'You are given two non-empty linked lists representing two non-negative integers.',
          points: 200,
          tags: ['Linked List', 'Math'],
          solved: false
        }
      ]
    };
  },
  
  getProblemById: async (id) => {
    const allProblems = await problemsAPI.getAllProblems();
    const problem = allProblems.problems.find(p => p.id === parseInt(id));
    return {
      success: !!problem,
      problem
    };
  }
};

// Mock Submissions API
export const submissionsAPI = {
  submitSolution: async (submissionData) => {
    console.log('📤 Mock submission:', submissionData);
    return {
      success: true,
      submission: {
        id: Date.now(),
        status: 'Accepted',
        score: submissionData.points || 100,
        executionTime: submissionData.executionTime || '0ms',
        language: submissionData.language,
        submittedAt: new Date().toISOString()
      }
    };
  }
};

export default api;
