import apiClient from "@/lib/axios";
import { User } from "@/types";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constants";

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface AuthResponse extends User {
  accessToken?: string;
}

export const authService = {
  /**
   * Authenticate user with DummyJSON auth endpoint
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });

    const data = response.data;
    // DummyJSON v2 uses accessToken or token
    const token = data.token || data.accessToken || "";
    
    if (token && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data));
    }

    return data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH_ME);
    return response.data;
  },

  /**
   * Refresh auth token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_REFRESH, {
      refreshToken,
      expiresInMins: 60,
    });
    return response.data;
  },

  /**
   * Helper: Retrieve stored user from localStorage
   */
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Helper: Retrieve stored token from localStorage
   */
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Helper: Clear authentication state from localStorage
   */
  clearAuthSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },
};

export default authService;
