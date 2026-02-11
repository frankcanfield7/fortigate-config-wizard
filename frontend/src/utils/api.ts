import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Configuration,
  ConfigurationCreate,
  ConfigurationUpdate,
  ApiError,
  PaginatedResponse,
} from '../types';

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<{ access_token: string }>(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post<{ access_token: string }>(
      '/api/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  },
};

// Configuration API
export const configApi = {
  getAll: async (page = 1, perPage = 20): Promise<PaginatedResponse<Configuration>> => {
    const response = await api.get<PaginatedResponse<Configuration>>(
      `/api/configs?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<Configuration> => {
    const response = await api.get<Configuration>(`/api/configs/${id}`);
    return response.data;
  },

  create: async (data: ConfigurationCreate): Promise<Configuration> => {
    const response = await api.post<Configuration>('/api/configs', data);
    return response.data;
  },

  update: async (id: number, data: ConfigurationUpdate): Promise<Configuration> => {
    const response = await api.put<Configuration>(`/api/configs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/configs/${id}`);
  },

  duplicate: async (id: number): Promise<Configuration> => {
    const response = await api.post<Configuration>(`/api/configs/${id}/duplicate`);
    return response.data;
  },

  export: async (
    id: number,
    format: 'cli' | 'json' | 'yaml'
  ): Promise<{ data: string; filename: string }> => {
    const response = await api.get<{ data: string; filename: string }>(
      `/api/configs/${id}/export?format=${format}`
    );
    return response.data;
  },
};

// Template API
export const templateApi = {
  getAll: async (): Promise<Configuration[]> => {
    const response = await api.get<Configuration[]>('/api/templates');
    return response.data;
  },

  createFromTemplate: async (templateId: number, name: string): Promise<Configuration> => {
    const response = await api.post<Configuration>(`/api/templates/${templateId}/create`, {
      name,
    });
    return response.data;
  },
};

export default api;
