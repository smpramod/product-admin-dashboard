"use client";

import React from "react";
import { 
  Search, 
  X, 
  Filter, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  Tag
} from "lucide-react";
import { CategoryItem } from "@/types";

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

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sortValue: string) => void;
  categories: CategoryItem[];
  categoriesLoading?: boolean;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  categories,
  categoriesLoading = false,
  onResetFilters,
  isFiltered,
}: ProductFiltersProps) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200 shadow-card">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search Input (md:col-span-5) */}
        <div className="md:col-span-5 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, brand, keyword..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-2xs focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-hidden transition"
              title="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown (md:col-span-4) */}
        <div className="md:col-span-4 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Tag className="h-4 w-4" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={categoriesLoading}
            aria-label="Filter by Category"
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-8 py-2.5 text-sm font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer truncate"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown (md:col-span-3) */}
        <div className="md:col-span-3 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <ArrowUpDown className="h-4 w-4" />
          </div>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort products"
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-8 py-2.5 text-sm font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer truncate"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Active Filter Chips & Reset Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="h-3 w-3" /> Active Filters:
            </span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                <span>Query: &ldquo;{searchTerm}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-indigo-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100 capitalize">
                <span>Category: {selectedCategory.replace(/-/g, " ")}</span>
                <button
                  type="button"
                  onClick={() => onCategoryChange("")}
                  className="hover:text-indigo-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedSort && selectedSort !== "default" && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                <span>Sorted by: {SORT_OPTIONS.find((o) => o.value === selectedSort)?.label}</span>
                <button
                  type="button"
                  onClick={() => onSortChange("default")}
                  className="hover:text-slate-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
