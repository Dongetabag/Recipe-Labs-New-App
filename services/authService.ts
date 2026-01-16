// Recipe Labs Auth Service
// SQLite-based authentication via Agent API

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'recipe_labs_token';
const USER_KEY = 'recipe_labs_user';

export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  expiresAt?: string;
  error?: string;
  profiles?: Record<string, any>;
}

export interface ProfileData {
  [key: string]: any;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  // Load token and user from localStorage
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch {
          this.user = null;
        }
      }
    }
  }

  // Save to localStorage
  private saveToStorage(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.token = token;
    this.user = user;
  }

  // Clear storage
  private clearStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.token = null;
    this.user = null;
  }

  // Get auth headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Get current user
  getUser(): User | null {
    return this.user;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Sign up new user
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        this.saveToStorage(data.token, data.user);
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: data.error || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        this.saveToStorage(data.token, data.user);
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${AGENT_API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearStorage();
    }
  }

  // Validate token and get current user with profiles
  async validateSession(): Promise<AuthResponse> {
    if (!this.token) {
      return { success: false, error: 'No token' };
    }

    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        this.clearStorage();
        return { success: false, error: 'Session expired' };
      }

      const data = await response.json();

      if (data.success && data.user) {
        this.user = data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user, profiles: data.profiles };
      }

      this.clearStorage();
      return { success: false, error: 'Invalid session' };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update user profile
  async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/me`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.user = data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Update failed' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      return { success: data.success, error: data.error };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get module-specific profile data
  async getModuleData(module: string): Promise<ProfileData | null> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/profile/${module}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get module data error:', error);
      return null;
    }
  }

  // Save module-specific profile data
  async saveModuleData(module: string, data: ProfileData): Promise<boolean> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/profile/${module}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Save module data error:', error);
      return false;
    }
  }

  // Get all profile data
  async getAllProfiles(): Promise<Record<string, ProfileData>> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/profiles`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data.success ? data.profiles : {};
    } catch (error) {
      console.error('Get all profiles error:', error);
      return {};
    }
  }

  // Get user setting
  async getSetting(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/settings/${key}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data.success ? data.value : null;
    } catch (error) {
      console.error('Get setting error:', error);
      return null;
    }
  }

  // Set user setting
  async setSetting(key: string, value: string): Promise<boolean> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/auth/settings/${key}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ value }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Set setting error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
