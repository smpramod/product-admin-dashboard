# 📦 Product Admin Dashboard

> A production-grade, highly responsive Product Admin Dashboard built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5a29e4?style=flat-square&logo=axios)](https://axios-http.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Live Demo & Deployment
- **Live Demo Link:** [Deploy on Vercel / Netlify](https://github.com/smpramod/product-admin-dashboard)
- **Demo Review Credentials:**
  - **Username:** `emilys`
  - **Password:** `emilyspass`
  *(A 1-click **"Auto-Fill"** button is also provided directly on the login screen for instant evaluation).*

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Node.js:** `v18.17+` or `v20+` (Tested on Node `v24`)
- **Package Manager:** `npm` (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/smpramod/product-admin-dashboard.git
cd product-admin-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Production Build & Verification
```bash
npm run build
npm run start
```

---

## ✨ Features Checklist

### 1. Authentication & Route Protection
- [x] **Login Page (`/login`):** Validates credentials against DummyJSON `POST /auth/login` (`emilys` / `emilyspass`).
- [x] **Visual Error Feedback:** Shows explicit alert banners for invalid credentials or expired sessions.
- [x] **1-Click Demo Login:** Quick-fill button to immediately populate test credentials.
- [x] **Click Spam Prevention:** Disables submit buttons and renders a spinner to prevent duplicate concurrent authentication requests.
- [x] **Route Guards:** Automatically redirects unauthenticated users to `/login?redirect=...` and forwards logged-in users directly to `/products`.
- [x] **Dynamic Navbar:** Shows user avatar, full name, email, and one-click Logout that purges session tokens.

### 2. Product List & Responsive Layouts
- [x] **Desktop Table (`md:` and above):** Sticky header table with image thumbnails, title + brand, SKU, category badge, currency price + discount pill, visual star rating, and stock status indicators.
- [x] **Mobile Cards (`< md`):** Touch-friendly responsive card grid optimized for mobile screens.
- [x] **Visual Rating Component:** 5-star visual rating display with numeric score and review counts.
- [x] **Dynamic Stock Badges:** Color-coded inventory pill (Green: `>= 20` In Stock, Amber: `< 20` Low Stock, Red: `0` Out of Stock).

### 3. Custom Pagination (Zero External Libraries)
- [x] **Custom Logic:** Built completely from scratch without React Query, SWR, or third-party table packages.
- [x] **Range Counter:** Strictly formatted dynamic range label (e.g. *"Showing 21–40 of 194 products"*).
- [x] **Page Size Options:** Dropdown selector with `10`, `20`, and `50` items per page.
- [x] **Smart Page Navigation:** Page number buttons with smart ellipsis (`[1, •••, 4, 5, 6, •••, 20]`) and boundary-disabled Previous/Next buttons.
- [x] **Defensive URL Clamping:** Gracefully parses malformed URL parameters (e.g., `?page=abc` falls back to `1`; `?page=9999` auto-clamps to the last valid page).

### 4. Search, Filter, Sort & URL Query Sync
- [x] **Debounced Search:** Custom `useDebounce` hook (400ms delay) that triggers `/products/search?q=` only when the user pauses typing, auto-resetting to page 1.
- [x] **Race-Condition Elimination:** Integrated `AbortController` cancellation with Axios `signal` so older delayed responses (e.g., tested with `&delay=2000`) never overwrite newer query results.
- [x] **Category Filter:** Dynamic dropdown populated from `/products/categories`.
- [x] **Multi-Sorting:** Sort by Price (Low/High, High/Low), Rating (Highest First), and Title (A–Z, Z–A).
- [x] **Bidirectional URL State:** All filters (`search`, `category`, `sortBy`, `order`, `page`, `limit`) synchronize with URL query params. Refreshing the browser or sharing links preserves the exact state.
- [x] **Filter Badges & Reset:** Active filter chip indicators with individual clear buttons and a "Reset All" action.

### 5. Product Details View (`/products/[id]`)
- [x] **Interactive Gallery:** Multi-image carousel with clickable thumbnail preview selector.
- [x] **Comprehensive Specs:** Detailed price breakdown, discount tag, brand, SKU, dimensions, warranty, shipping terms, and return policy.
- [x] **Customer Reviews:** Real reviews breakdown with individual ratings, reviewer name, comment, and date.
- [x] **Custom 404 Screen:** Dedicated "Product Not Found" screen with a return link when viewing non-existent IDs (e.g. `/products/99999`).

### 6. CRUD Modals & Local State Persistence
- [x] **Add Product Modal:** Clean popup with validation for title, category, price, stock, and description.
- [x] **Edit Product Modal:** Pre-filled form fields allowing instant updates to existing products.
- [x] **Delete Confirmation Popup:** Explicit warning dialog before deleting any product.
- [x] **Local Storage Overlay Store:** DummyJSON mutations are simulated and do not persist to their cloud database. We implemented an optimistic local storage overlay store (`src/lib/mockStore.ts`) so created, edited, and deleted products reflect immediately across tables, counters, and detail pages.

### 7. UI States & Polish
- [x] **Skeleton Shimmer Loaders:** Clean loading skeletons for tables, cards, and detail views.
- [x] **Empty Search States:** Graphic placeholder with suggestions and a "Reset All Filters" button.
- [x] **Error Recovery:** Banner alerts with dedicated "Retry" action buttons.

---

## 🏛️ Architectural Choices & Design Decisions

1. **Next.js (App Router) + React 19:**
   - Provides server/client hybrid rendering, file-based routing, and optimal SEO meta tags while maintaining lightweight bundle sizes.
2. **Centralized Shared Axios Client (`src/lib/axios.ts`):**
   - Single point of configuration attaching `Authorization: Bearer <token>` to all outgoing requests via request interceptors.
   - Global response interceptor standardizes error messaging and automatically detects `401 Unauthorized` token expiry to invalidate sessions and notify auth state.
3. **Modular API Service Layer (`src/services/`):**
   - Decoupled API calls completely from UI components (`authService.ts`, `productService.ts`, `categoryService.ts`), following single-responsibility and clean architecture principles.
4. **Zero Third-Party Table / Query Libraries:**
   - All pagination math, state synchronization, and debounce handlers were written from vanilla React primitives to demonstrate core engineering fundamentals.
5. **Hybrid Category & Search Conflict Strategy:**
   - DummyJSON's REST API cannot combine `/products/search?q=` and `/products/category/` in a single endpoint. We implemented a hybrid strategy where broad search queries are filtered by category client-side, delivering a smooth, unified user experience.
6. **Local CRUD Overlay Persistence (`src/lib/mockStore.ts`):**
   - Allows reviewers to test creating, editing, and deleting products with immediate UI reflection without being blocked by DummyJSON's read-only backend limitations.

---

## 🛠️ Problem Faced & How We Fixed It

### **Problem: Search Race Conditions Under Variable Network Latency**
When users type rapidly in the search bar, multiple API requests are sent in quick succession. If an older request takes longer to resolve than a newer request (e.g., when tested with network latency like `&delay=2000`), the older slow response resolves *after* the newer one, overwriting the UI with outdated results.

### **Solution: Request Cancellation with `AbortController`**
In `src/app/products/page.tsx` and `productService.searchProducts`, we integrated a native `AbortController` reference:
```typescript
// Cancel any pending in-flight request before firing a new one
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}

const controller = new AbortController();
abortControllerRef.current = controller;

await productService.searchProducts({
  query: urlSearch,
  signal: controller.signal, // Passed directly to Axios
});
```
When a new keystroke occurs, any pending HTTP request is immediately aborted at the network level. In the Axios response interceptor and catch handler, `CanceledError` is safely caught and ignored, ensuring that only the latest keystroke's results ever render on the screen.

---

## 🤖 Where AI Assisted

- **Accelerating UI Scaffolding:** Quickly generating responsive Tailwind CSS utility classes, glassmorphism tokens, and mobile menu layouts.
- **Defensive Edge-Case Brainstorming:** Crafting safety clamps for malformed URL parameters (`?page=abc`, `?page=9999`) and double-click submission spam prevention.
- **TypeScript Interface Modeling:** Ensuring strict type safety across all DummyJSON response models (dimensions, reviews, meta tags, and categories).
- **Code Explainability:** All code is written clearly with self-documenting naming and modular separation so the developer can explain every line during live technical walkthroughs.

---

## 📂 Project Structure

```text
product-admin-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with fonts, AuthProvider & Navbar
│   │   ├── page.tsx                  # Root redirect to /products
│   │   ├── globals.css               # Design system, glassmorphism & shimmer utilities
│   │   ├── login/
│   │   │   └── page.tsx              # Login view with demo auto-fill & validation
│   │   └── products/
│   │       ├── page.tsx              # Products catalog dashboard with URL state
│   │       └── [id]/
│   │           └── page.tsx          # Product detail view with gallery & reviews
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx         # Client-side route protection wrapper
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Navigation header with user info & logout
│   │   │   └── Footer.tsx            # Clean application footer
│   │   └── products/
│   │       ├── ProductTable.tsx      # Desktop data table view
│   │       ├── ProductCards.tsx      # Mobile touch-friendly card grid
│   │       ├── Pagination.tsx        # Custom pagination bar with range counter
│   │       ├── ProductFilters.tsx    # Search bar, category dropdown & sort selector
│   │       ├── ProductModal.tsx      # Reusable Add & Edit product modal
│   │       ├── DeleteConfirmModal.tsx# Delete confirmation dialog
│   │       ├── ProductRating.tsx     # 5-star visual rating component
│   │       ├── StockBadge.tsx        # Dynamic inventory status badge
│   │       └── ProductSkeleton.tsx   # Loading skeleton placeholders
│   ├── context/
│   │   └── AuthContext.tsx           # Authentication state & session manager
│   ├── hooks/
│   │   └── useDebounce.ts            # Custom 400ms search input debouncer
│   ├── lib/
│   │   ├── axios.ts                  # Centralized Axios client with interceptors
│   │   ├── mockStore.ts              # Local CRUD overlay store for mock persistence
│   │   └── utils.ts                  # Currency formatting & class merge helper
│   ├── services/
│   │   ├── authService.ts            # Login, getCurrentUser, and session helpers
│   │   ├── productService.ts         # Products CRUD & search API methods
│   │   └── categoryService.ts        # Categories list & normalization methods
│   └── types/
│       └── index.ts                  # Core TypeScript interfaces & types
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📄 License
This project was developed as a frontend technical assignment. Code is available under the MIT License.
