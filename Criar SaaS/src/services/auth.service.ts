import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.success) {
      api.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.success) {
      api.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } finally {
      api.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  isAuthenticated(): boolean {
    return api.isAuthenticated();
  }
}

export const authService = new AuthService();