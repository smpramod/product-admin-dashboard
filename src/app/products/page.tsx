"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductCards } from "@/components/products/ProductCards";
import { Pagination } from "@/components/products/Pagination";
import { ProductTableSkeleton } from "@/components/products/ProductSkeleton";
import { ProductFilters, SORT_OPTIONS } from "@/components/products/ProductFilters";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import { useDebounce } from "@/hooks/useDebounce";
import { Product, CategoryItem } from "@/types";
import { 
  Package, 
  RefreshCw, 
  AlertCircle, 
  SearchX
} from "lucide-react";

function ProductsDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // 1. URL Query Parameter Parsing
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlSortBy = searchParams.get("sortBy") || "";
  const urlOrder = (searchParams.get("order") as "asc" | "desc") || "asc";

  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1;
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : 10;
  const pageSize = [10, 20, 50].includes(parsedLimit) ? parsedLimit : 10;

  // Determine active sort value string for the dropdown
  const getSortDropdownValue = () => {
    if (!urlSortBy) return "default";
    return `${urlSortBy}-${urlOrder}`;
  };

  // 2. Component State
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // AbortController ref to prevent search race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  // 3. Helper to update URL query parameters cleanly
  const updateUrlParams = useCallback(
    (paramsToUpdate: Record<string, string | number | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    },
    [searchParams, pathname, router]
  );

  // 4. Sync searchInput when URL query changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // 5. Update URL when debounced search term changes
  useEffect(() => {
    // Only update if debounced value is different from current URL param
    if (debouncedSearch !== urlSearch) {
      updateUrlParams({
        search: debouncedSearch.trim() ? debouncedSearch.trim() : null,
        page: 1, // Reset to page 1 on search change
      });
    }
  }, [debouncedSearch, urlSearch, updateUrlParams]);

  // 6. Fetch Categories on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const catList = await categoryService.getCategories();
        if (isMounted) {
          setCategories(catList);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 7. Main Data Fetching with AbortController & Conflict Resolution
  const fetchProducts = useCallback(async () => {
    // Cancel any previous in-flight request to eliminate race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    const skip = (currentPage - 1) * pageSize;

    try {
      let data;

      // Strategy: Handle combinations of search, category, and sorting
      if (urlSearch && urlCategory) {
        // Hybrid Strategy: DummyJSON cannot combine /search?q= and /category/ on one endpoint.
        // Fetch search results and apply category filtering client-side for consistent UX.
        const searchResult = await productService.searchProducts({
          query: urlSearch,
          limit: 100, // get broad search matches to filter by category
          sortBy: urlSortBy || undefined,
          order: urlOrder,
          signal: controller.signal,
        });

        const filtered = searchResult.products.filter(
          (p) => p.category.toLowerCase() === urlCategory.toLowerCase()
        );

        data = {
          products: filtered.slice(skip, skip + pageSize),
          total: filtered.length,
          skip,
          limit: pageSize,
        };
      } else if (urlSearch) {
        // Search API endpoint
        data = await productService.searchProducts({
          query: urlSearch,
          limit: pageSize,
          skip,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
          signal: controller.signal,
        });
      } else if (urlCategory) {
        // Category API endpoint
        data = await productService.getProductsByCategory({
          category: urlCategory,
          limit: pageSize,
          skip,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
        });
      } else {
        // Standard paginated products list
        data = await productService.getProducts({
          limit: pageSize,
          skip,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
        });
      }

      setProducts(data.products || []);
      setTotal(data.total || 0);

      // Safe page clamping
      const maxPage = Math.max(1, Math.ceil((data.total || 0) / pageSize));
      if (currentPage > maxPage && data.total > 0) {
        updateUrlParams({ page: maxPage });
      }
    } catch (err: unknown) {
      // Ignore AbortController cancellations
      if (err instanceof Error && (err.name === "CanceledError" || err.message === "Request was cancelled.")) {
        return;
      }
      const msg =
        err instanceof Error ? err.message : "Failed to load products. Please check your connection.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, urlSearch, urlCategory, urlSortBy, urlOrder, updateUrlParams]);

  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // 8. Event Handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryChange = (category: string) => {
    updateUrlParams({
      category: category || null,
      page: 1, // Reset to page 1 on category change
    });
  };

  const handleSortChange = (sortValue: string) => {
    const selected = SORT_OPTIONS.find((s) => s.value === sortValue);
    if (!selected || selected.value === "default") {
      updateUrlParams({
        sortBy: null,
        order: null,
        page: 1,
      });
    } else {
      updateUrlParams({
        sortBy: selected.sortBy || null,
        order: selected.order || null,
        page: 1,
      });
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    router.push(pathname); // Reset all query parameters
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrlParams({ limit: newSize, page: 1 });
  };

  const isFiltered = Boolean(urlSearch || urlCategory || (urlSortBy && getSortDropdownValue() !== "default"));

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
              Products Catalog
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
              {total} {total === 1 ? "Product" : "Products"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter by category, sort, and manage products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition"
            title="Refresh product list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <ProductFilters
        searchTerm={searchInput}
        onSearchChange={handleSearchChange}
        selectedCategory={urlCategory}
        onCategoryChange={handleCategoryChange}
        selectedSort={getSortDropdownValue()}
        onSortChange={handleSortChange}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Error Banner with Retry */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-rose-900">Failed to fetch product data</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 active:scale-95 transition self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Main Products Content Area */}
      {isLoading ? (
        <ProductTableSkeleton rows={pageSize} />
      ) : products.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3.5 border border-slate-200">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <SearchX className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">No matching products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isFiltered
                ? "Try adjusting your search keywords, clearing category filters, or resetting the view."
                : "No products currently available in this catalog view."}
            </p>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <ProductTable products={products} />

          {/* Mobile Cards View */}
          <ProductCards products={products} />

          {/* Custom Pagination Bar */}
          <div className="glass-card rounded-2xl p-2 sm:p-4 border border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<ProductTableSkeleton rows={10} />}>
        <ProductsDashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
