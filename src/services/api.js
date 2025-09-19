// src/services/api.js
import axios from 'axios';

// Base URL for API calls
const BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    setCurrentUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
    }
};

// User API
export const userAPI = {
    getAllUsers: async (params = {}) => {
        try {
            const response = await api.get('/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await api.get(`/user/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/user', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/user/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/user/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getDepartments: async () => {
        try {
            const response = await api.get('/users/meta/departments');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getBatches: async () => {
        try {
            const response = await api.get('/users/meta/batches');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getDivisions: async () => {
        try {
            const response = await api.get('/users/meta/divisions');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Problems API
export const problemsAPI = {
    getAllProblems: async (params = {}) => {
        try {
            const response = await api.get('/api/problems', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProblemById: async (id) => {
        try {
            const response = await api.get(`/api/problems/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createProblem: async (problemData) => {
        try {
            const response = await api.post('/api/problems', problemData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateProblem: async (id, problemData) => {
        try {
            const response = await api.put(`/api/problems/${id}`, problemData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteProblem: async (id) => {
        try {
            const response = await api.delete(`/api/problems/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getAllTags: async () => {
        try {
            const response = await api.get('/api/problems/meta/tags');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getStatistics: async () => {
        try {
            const response = await api.get('/api/problems/meta/statistics');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Contest API
export const contestAPI = {
    getAllContests: async (params = {}) => {
        try {
            const response = await api.get('/api/contests', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getContestById: async (id) => {
        try {
            const response = await api.get(`/api/contests/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createContest: async (contestData) => {
        try {
            const response = await api.post('/api/contests', contestData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateContest: async (id, contestData) => {
        try {
            const response = await api.put(`/api/contests/${id}`, contestData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteContest: async (id) => {
        try {
            const response = await api.delete(`/api/contests/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    registerParticipant: async (contestId, userId) => {
        try {
            const response = await api.post(`/api/contests/${contestId}/register`, { userId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    registerManualStudents: async (contestId, studentIds) => {
        try {
            const response = await api.post(`/api/contests/${contestId}/register-manual`, { studentIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getAvailableStudents: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/${contestId}/available-students`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getContestLeaderboard: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/${contestId}/leaderboard`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateContestStatus: async (contestId, status) => {
        try {
            const response = await api.post(`/api/contests/${contestId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Submissions API
export const submissionsAPI = {
    submitCode: async (submissionData) => {
        try {
            const response = await api.post('/api/submissions/submit', submissionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getSubmissionById: async (id) => {
        try {
            const response = await api.get(`/api/submissions/submission/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserSubmissions: async (userId, params = {}) => {
        try {
            const response = await api.get(`/api/submissions/user/${userId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getAllSubmissions: async (params = {}) => {
        try {
            const response = await api.get('/api/submissions', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getSubmissionStats: async () => {
        try {
            const response = await api.get('/api/submissions/stats/overview');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Compiler API
export const compilerAPI = {
    compileCode: async (codeData) => {
        try {
            const response = await api.post('/compile', codeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getSupportedLanguages: async () => {
        try {
            const response = await api.get('/compile/languages');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getCompilerStats: async () => {
        try {
            const response = await api.get('/compile/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Auto-save API
export const autoSaveAPI = {
    saveCode: async (autoSaveData) => {
        try {
            const response = await api.post('/api/autosave/save', autoSaveData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    loadCode: async (userId, problemId, contestId = null) => {
        try {
            const params = contestId ? { contestId } : {};
            const response = await api.get(`/api/autosave/load/${userId}/${problemId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getRestoreOptions: async (userId, problemId, contestId = null) => {
        try {
            const params = contestId ? { contestId } : {};
            const response = await api.get(`/api/autosave/restore-options/${userId}/${problemId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    loadLatestSubmission: async (userId, problemId, contestId = null) => {
        try {
            const params = contestId ? { contestId } : {};
            const response = await api.get(`/api/autosave/submission/${userId}/${problemId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    clearAutoSave: async (userId, problemId, contestId = null) => {
        try {
            const params = contestId ? { contestId } : {};
            const response = await api.delete(`/api/autosave/clear/${userId}/${problemId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserAutoSaves: async (userId, params = {}) => {
        try {
            const response = await api.get(`/api/autosave/user/${userId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default api;
