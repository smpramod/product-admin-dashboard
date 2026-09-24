/**
 * Centralized Application Constants
 * All configuration values, API endpoints, storage keys, and defaults across the app.
 */

// 1. API Configuration & Endpoints
export const API_BASE_URL = "https://dummyjson.com";
export const API_TIMEOUT = 15000; // 15 seconds

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/auth/login",
  AUTH_ME: "/auth/me",
  AUTH_REFRESH: "/auth/refresh",

  // Products
  PRODUCTS: "/products",
  PRODUCTS_SEARCH: "/products/search",
  PRODUCTS_CATEGORIES: "/products/categories",
  PRODUCTS_CATEGORY_LIST: "/products/category-list",
  PRODUCTS_BY_CATEGORY: "/products/category",
  PRODUCTS_ADD: "/products/add",
} as const;

// 2. LocalStorage Persistence Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  MOCK_ADDED: "mock_added_products",
  MOCK_EDITED: "mock_edited_products",
  MOCK_DELETED: "mock_deleted_product_ids",
} as const;

// 3. Demo Login Credentials (DummyJSON Test Account)
export const DEMO_CREDENTIALS = {
  USERNAME: "emilys",
  PASSWORD: "emilyspass",
} as const;

// 4. Pagination Constants
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS: readonly number[] = [10, 20, 50];

// 5. Search & Debounce Configuration
export const SEARCH_DEBOUNCE_MS = 400;

// 6. UI & Toast Timing
export const TOAST_DURATION_MS = 4000;

// 7. Custom Browser Events
export const CUSTOM_EVENTS = {
  AUTH_UNAUTHORIZED: "auth:unauthorized",
} as const;

// 8. Sorting Definitions
export interface SortOption {
  label: string;
  sortBy?: string;
  order?: "asc" | "desc";
  value: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: "Default (Featured)", value: "default" },
  { label: "Price: Low to High", sortBy: "price", order: "asc", value: "price-asc" },
  { label: "Price: High to Low", sortBy: "price", order: "desc", value: "price-desc" },
  { label: "Rating: Highest First", sortBy: "rating", order: "desc", value: "rating-desc" },
  { label: "Title: A to Z", sortBy: "title", order: "asc", value: "title-asc" },
  { label: "Title: Z to A", sortBy: "title", order: "desc", value: "title-desc" },
];

// 9. Media & Placeholder Assets
export const DEFAULT_PRODUCT_THUMBNAIL =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
