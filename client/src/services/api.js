import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log successful requests in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }

    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Calculate request duration
    if (originalRequest.metadata) {
      const endTime = new Date();
      const duration = endTime - originalRequest.metadata.startTime;

      // Log failed requests in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url} (${duration}ms)`, error.response?.data);
      }
    }

    // Don't show toasts for auth endpoints - let components handle them
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Only show toasts for non-auth endpoints
      if (!isAuthEndpoint) {
        switch (status) {
          case 401:
            // Unauthorized - token expired or invalid
            if (!originalRequest._retry) {
              originalRequest._retry = true;
              
              // Clear invalid token
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Show user-friendly message
              toast.error('Session expired. Please log in again.');
              
              // Redirect to login
              window.location.href = '/login';
            }
            break;

          case 403:
            toast.error('Access denied. You don\'t have permission to perform this action.');
            break;

          case 404:
            toast.error('Resource not found.');
            break;

          case 422:
            // Validation errors
            if (data.details && Array.isArray(data.details)) {
              data.details.forEach(detail => {
                toast.error(`${detail.field}: ${detail.message}`);
              });
            } else {
              toast.error(data.error || 'Validation failed.');
            }
            break;

          case 429:
            toast.error('Too many requests. Please try again later.');
            break;

          case 500:
            toast.error('Server error. Please try again later.');
            break;
        }
      }
    } else if (error.request && !isAuthEndpoint) {
      // Network error (but not for auth endpoints)
      toast.error('Network error. Please check your internet connection.');
    }

    return Promise.reject(error);
  }
);

// API service methods
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Server returns {success: true, data: {token, user}}
    if (response.data?.data) {
      return response.data.data; // Return just the {token, user} object
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Server returns {success: true, data: {token, user}}
    if (response.data?.data) {
      return response.data.data; // Return just the {token, user} object
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    // Server returns {success: true, data: {user}}
    if (response.data?.data) {
      return response.data.data; 
    }
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
};

export const taskService = {
  getAll: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export const projectService = {
  getAll: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export const monthGoalService = {
  getCurrent: async () => {
    const response = await api.get('/month-goals/current');
    return response.data;
  },

  getByMonth: async (month, year) => {
    const response = await api.get(`/month-goals/${month}/${year}`);
    return response.data;
  },

  create: async (goalData) => {
    const response = await api.post('/month-goals', goalData);
    return response.data;
  },

  update: async (id, goalData) => {
    const response = await api.put(`/month-goals/${id}`, goalData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/month-goals/${id}`);
    return response.data;
  },
};

// Export the default instance for custom requests
export default api;
