import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = "https://dummyjson.com";

// Centralized Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Request Interceptor: Automatically attach Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Unified Error Response Interface
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  raw?: unknown;
}

// Response Interceptor: Centralized error handling & token expiry detection
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    let formattedError: ApiErrorResponse = {
      message: "An unexpected error occurred. Please try again.",
      statusCode: error.response?.status,
      raw: error,
    };

    if (error.code === "ERR_CANCELED") {
      formattedError.message = "Request was cancelled.";
    } else if (error.response) {
      // Server responded with a status code out of 2xx range
      const serverMessage = error.response.data?.message;
      const status = error.response.status;

      if (status === 401) {
        formattedError.message = serverMessage || "Session expired or invalid credentials. Please log in.";
        if (typeof window !== "undefined") {
          // Clear credentials if token expired
          const currentPath = window.location.pathname;
          if (currentPath !== "/login") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            // Dispatch a custom event to notify auth context
            window.dispatchEvent(new Event("auth:unauthorized"));
          }
        }
      } else if (status === 404) {
        formattedError.message = serverMessage || "Resource not found.";
      } else if (status === 500) {
        formattedError.message = serverMessage || "Internal server error. Please try again later.";
      } else {
        formattedError.message = serverMessage || `Request failed with status ${status}.`;
      }
    } else if (error.request) {
      // Request was made but no response was received (Network error)
      formattedError.message = "Unable to connect to server. Please check your internet connection.";
    }

    return Promise.reject(formattedError);
  }
);

export default apiClient;
