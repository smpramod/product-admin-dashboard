"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductCards } from "@/components/products/ProductCards";
import { Pagination } from "@/components/products/Pagination";
import { ProductTableSkeleton } from "@/components/products/ProductSkeleton";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductModal } from "@/components/products/ProductModal";
import { DeleteConfirmModal } from "@/components/products/DeleteConfirmModal";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import mockStore from "@/lib/mockStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Product, CategoryItem, CreateProductInput } from "@/types";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SEARCH_DEBOUNCE_MS,
  TOAST_DURATION_MS,
  SORT_OPTIONS,
} from "@/constants";
import { 
  RefreshCw, 
  AlertCircle, 
  SearchX,
  Plus,
  CheckCircle2
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

  const parsedPage = rawPage ? parseInt(rawPage, 10) : DEFAULT_PAGE;
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;

  const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : DEFAULT_PAGE_SIZE;
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(parsedLimit)
    ? parsedLimit
    : DEFAULT_PAGE_SIZE;

  const getSortDropdownValue = () => {
    if (!urlSortBy) return "default";
    return `${urlSortBy}-${urlOrder}`;
  };

  // 2. State
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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

  // 4. Sync searchInput when URL changes externally
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // 5. Update URL when debounced search term changes
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrlParams({
        search: debouncedSearch.trim() ? debouncedSearch.trim() : null,
        page: DEFAULT_PAGE,
      });
    }
  }, [debouncedSearch, urlSearch, updateUrlParams]);

  // 6. Fetch Categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const catList = await categoryService.getCategories();
        if (isMounted) setCategories(catList);
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

  // Show auto-dismiss toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  };

  // 7. Main Data Fetching with Local Mock Overlay
  const fetchProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    const skip = (currentPage - 1) * pageSize;

    try {
      let rawProducts: Product[] = [];
      let calculatedTotal = 0;

      if (urlSearch && urlCategory) {
        // Hybrid: Broad search + Category filter
        const searchResult = await productService.searchProducts({
          query: urlSearch,
          limit: 100,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
          signal: controller.signal,
        });

        // Apply local overlay & filter
        const overlayed = mockStore.applyOverlayToList(searchResult.products);
        const filtered = overlayed.filter(
          (p) => p.category.toLowerCase() === urlCategory.toLowerCase()
        );

        rawProducts = filtered.slice(skip, skip + pageSize);
        calculatedTotal = filtered.length;
      } else if (urlSearch) {
        const searchResult = await productService.searchProducts({
          query: urlSearch,
          limit: pageSize,
          skip,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
          signal: controller.signal,
        });

        rawProducts = mockStore.applyOverlayToList(searchResult.products);
        calculatedTotal = searchResult.total;
      } else if (urlCategory) {
        const categoryResult = await productService.getProductsByCategory({
          category: urlCategory,
          limit: pageSize,
          skip,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
        });

        rawProducts = mockStore.applyOverlayToList(categoryResult.products);
        calculatedTotal = categoryResult.total;
      } else {
        const baseResult = await productService.getProducts({
          limit: pageSize,
          skip,
          sortBy: urlSortBy || undefined,
          order: urlOrder,
        });

        rawProducts = mockStore.applyOverlayToList(baseResult.products);
        calculatedTotal = baseResult.total + mockStore.getAddedProducts().length - mockStore.getDeletedProductIds().length;
      }

      setProducts(rawProducts);
      setTotal(Math.max(0, calculatedTotal));

      const maxPage = Math.max(1, Math.ceil(calculatedTotal / pageSize));
      if (currentPage > maxPage && calculatedTotal > 0) {
        updateUrlParams({ page: maxPage });
      }
    } catch (err: unknown) {
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
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProducts]);

  // 8. CRUD Handlers with Mock Store Overlay
  const handleAddProduct = async (formData: CreateProductInput) => {
    // 1. Call API to get dummy response structure
    const apiResult = await productService.addProduct(formData);
    // 2. Persist in Local Mock Store
    const saved = mockStore.saveAddedProduct({ ...formData, id: apiResult.id || Date.now() });
    
    showToast(`Product "${saved.title}" created successfully! (Mock saved)`);
    fetchProducts();
  };

  const handleEditProduct = async (formData: CreateProductInput) => {
    if (!editingProduct) return;
    // 1. Call API
    await productService.updateProduct(editingProduct.id, formData);
    // 2. Persist override in Local Mock Store
    mockStore.saveEditedProduct(editingProduct.id, formData);

    showToast(`Product "${formData.title}" updated successfully!`);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    // 1. Call API
    await productService.deleteProduct(deletingProduct.id);
    // 2. Save in Local Mock Store deleted list
    mockStore.saveDeletedProductId(deletingProduct.id);

    showToast(`Product "${deletingProduct.title}" deleted.`);
    setDeletingProduct(null);
    fetchProducts();
  };

  // Filter and pagination handlers
  const handleSearchChange = (val: string) => setSearchInput(val);
  const handleCategoryChange = (cat: string) => updateUrlParams({ category: cat || null, page: DEFAULT_PAGE });
  const handleSortChange = (sortValue: string) => {
    const selected = SORT_OPTIONS.find((s) => s.value === sortValue);
    if (!selected || selected.value === "default") {
      updateUrlParams({ sortBy: null, order: null, page: DEFAULT_PAGE });
    } else {
      updateUrlParams({ sortBy: selected.sortBy || null, order: selected.order || null, page: DEFAULT_PAGE });
    }
  };
  const handleResetFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };
  const handlePageChange = (newPage: number) => updateUrlParams({ page: newPage });
  const handlePageSizeChange = (newSize: number) => updateUrlParams({ limit: newSize, page: DEFAULT_PAGE });

  const isFiltered = Boolean(urlSearch || urlCategory || (urlSortBy && getSortDropdownValue() !== "default"));

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl animate-slide-down text-xs font-medium border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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

        <div className="flex items-center gap-2.5">
          {/* Add Product Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>

          {/* Refresh Button */}
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
          <ProductTable 
            products={products} 
            onEdit={(p) => setEditingProduct(p)}
            onDelete={(p) => setDeletingProduct(p)}
          />

          {/* Mobile Cards View */}
          <ProductCards 
            products={products} 
            onEdit={(p) => setEditingProduct(p)}
            onDelete={(p) => setDeletingProduct(p)}
          />

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

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
        categories={categories}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleEditProduct}
        product={editingProduct}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        product={deletingProduct}
      />

    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<ProductTableSkeleton rows={DEFAULT_PAGE_SIZE} />}>
        <ProductsDashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
