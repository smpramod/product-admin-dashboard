"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductCards } from "@/components/products/ProductCards";
import { Pagination } from "@/components/products/Pagination";
import { ProductTableSkeleton } from "@/components/products/ProductSkeleton";
import productService from "@/services/productService";
import { Product } from "@/types";
import { 
  Package, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  Layers
} from "lucide-react";

function ProductsDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Defensive parsing of URL query params
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");

  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1;
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : 10;
  const pageSize = [10, 20, 50].includes(parsedLimit) ? parsedLimit : 10;

  // Local state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to update URL query params defensively
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

  // Fetch products from DummyJSON API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const skip = (currentPage - 1) * pageSize;

    try {
      const data = await productService.getProducts({
        limit: pageSize,
        skip,
      });

      setProducts(data.products || []);
      setTotal(data.total || 0);

      // Clamping check: If current page is beyond total pages (e.g. ?page=9999), safely auto-correct to last page
      const maxPage = Math.max(1, Math.ceil((data.total || 0) / pageSize));
      if (currentPage > maxPage && data.total > 0) {
        updateUrlParams({ page: maxPage });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load products. Please check your connection.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, updateUrlParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  // Handle page size changes
  const handlePageSizeChange = (newSize: number) => {
    // Reset to page 1 on page size change
    updateUrlParams({ limit: newSize, page: 1 });
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
              Products Catalog
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
              {total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and manage all catalog products retrieved from DummyJSON API.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Content Area */}
      {isLoading ? (
        <ProductTableSkeleton rows={pageSize} />
      ) : products.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Products Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We could not find any products for this page or query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <ProductTable products={products} />

          {/* Mobile Cards */}
          <ProductCards products={products} />

          {/* Custom Pagination Component */}
          <div className="glass-card rounded-2xl p-2 sm:p-4">
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
