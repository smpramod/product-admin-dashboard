import apiClient from "@/lib/axios";
import { User } from "@/types";

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface AuthResponse extends User {
  accessToken?: string;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  /**
   * Authenticate user with DummyJSON auth endpoint
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });

    const data = response.data;
    // DummyJSON v2 uses accessToken or token
    const token = data.token || data.accessToken || "";
    
    if (token && typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    }

    return data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  /**
   * Refresh auth token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post("/auth/refresh", {
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
      const user = localStorage.getItem(USER_KEY);
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
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Helper: Clear authentication state from localStorage
   */
  clearAuthSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};

export default authService;
