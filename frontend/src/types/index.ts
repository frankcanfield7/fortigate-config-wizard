// User types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Configuration types
export interface Configuration {
  id: number;
  user_id: number;
  config_type: string;
  name: string;
  description?: string;
  data_json: string;
  tags?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationCreate {
  config_type: string;
  name: string;
  description?: string;
  data: Record<string, any>;
  tags?: string;
  is_template?: boolean;
}

export interface ConfigurationUpdate {
  name?: string;
  description?: string;
  data?: Record<string, any>;
  tags?: string;
  is_template?: boolean;
  change_description?: string;
}

// Version types
export interface ConfigurationVersion {
  id: number;
  config_id: number;
  version: number;
  data_json: string;
  change_description?: string;
  created_at: string;
  created_by: number;
}

// API response types
export interface ApiError {
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
