"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProductRating } from "@/components/products/ProductRating";
import { StockBadge } from "@/components/products/StockBadge";
import productService from "@/services/productService";
import mockStore from "@/lib/mockStore";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Star,
  Calendar,
  User,
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      setNotFound(false);
      setError(null);

      const numericId = parseInt(id, 10);

      // 1. Check local mock store overlay first
      if (!isNaN(numericId)) {
        const localProduct = mockStore.applyOverlayToSingle(numericId, null);
        if (localProduct && localProduct.isLocalMock) {
          setProduct(localProduct);
          setSelectedImage(localProduct.thumbnail || localProduct.images?.[0] || "");
          setIsLoading(false);
          return;
        }
      }

      // 2. Fetch from DummyJSON API
      try {
        const data = await productService.getProductById(id);
        const overlayed = !isNaN(numericId)
          ? mockStore.applyOverlayToSingle(numericId, data)
          : data;

        if (!overlayed) {
          setNotFound(true);
        } else {
          setProduct(overlayed);
          setSelectedImage(overlayed.thumbnail || overlayed.images?.[0] || "");
        }
      } catch (err: unknown) {
        const errObj = err as { statusCode?: number; message?: string };
        if (errObj.statusCode === 404 || String(errObj.message).includes("not found")) {
          setNotFound(true);
        } else {
          setError(errObj.message || "Failed to load product details.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  return (
    <AuthGuard>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>

          {product && (
            <span className="text-xs font-mono text-slate-400">
              Product ID: #{product.id}
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="glass-card rounded-2xl p-8 border border-slate-200 animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-80 bg-slate-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
                <div className="h-6 w-1/3 bg-slate-200 rounded" />
                <div className="h-24 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        ) : notFound ? (
          /* 404 Not Found State */
          <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-card">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <HelpCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 font-display">
                Product Not Found
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn&apos;t find any product with ID <span className="font-mono font-semibold text-slate-700">&ldquo;{id}&rdquo;</span>. It may have been deleted or the URL is invalid.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Product Catalog
              </Link>
            </div>
          </div>
        ) : error ? (
          /* Error State with Retry */
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900 text-sm">Error Loading Product</p>
                <p className="text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        ) : product ? (
          /* Product Details Content */
          <div className="space-y-8">
            
            {/* Main Product Overview Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Left: Image Gallery (5 Columns) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Main Active Image */}
                  <div className="relative aspect-square w-full rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center overflow-hidden shadow-xs">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-slate-300" />
                    )}
                    {product.discountPercentage && product.discountPercentage > 0 ? (
                      <span className="absolute top-3 left-3 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                        {product.discountPercentage}% OFF
                      </span>
                    ) : null}
                  </div>

                  {/* Thumbnail Selector Carousel */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className={`relative h-16 w-16 shrink-0 rounded-xl border-2 p-1 bg-white transition ${
                            selectedImage === img
                              ? "border-indigo-600 shadow-xs ring-2 ring-indigo-500/20"
                              : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.title} thumbnail ${idx + 1}`}
                            className="h-full w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Product Info & Specs (7 Columns) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-3.5">
                    {/* Category & SKU */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 capitalize border border-indigo-100">
                        <Tag className="h-3 w-3 mr-1" />
                        {product.category.replace(/-/g, " ")}
                      </span>
                      {product.brand && (
                        <span className="text-xs font-medium text-slate-500">
                          Brand: <strong className="text-slate-800">{product.brand}</strong>
                        </span>
                      )}
                      {product.sku && (
                        <span className="text-xs font-mono text-slate-400">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
                      {product.title}
                    </h1>

                    {/* Rating & Stock Row */}
                    <div className="flex flex-wrap items-center gap-4 py-1">
                      <ProductRating
                        rating={product.rating}
                        reviewsCount={product.reviews?.length}
                        size="md"
                      />
                      <span className="text-slate-300">•</span>
                      <StockBadge stock={product.stock} />
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-3 pt-2">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 ? (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          {formatCurrency(
                            product.price / (1 - product.discountPercentage / 100)
                          )}
                        </span>
                      ) : null}
                    </div>

                    {/* Description */}
                    <div className="pt-2">
                      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Description
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <ShieldCheck className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Warranty</p>
                        <p className="text-[11px] text-slate-500">
                          {product.warrantyInformation || "1 Year Official Warranty"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Truck className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Shipping</p>
                        <p className="text-[11px] text-slate-500">
                          {product.shippingInformation || "Free Express Delivery"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <RotateCcw className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Return Policy</p>
                        <p className="text-[11px] text-slate-500">
                          {product.returnPolicy || "30 Days Hassle-free Returns"}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Customer Reviews & Feedback
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified customer testimonials and ratings for this product.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  <Star className="h-3.5 w-3.5 fill-indigo-600" />
                  <span>{product.rating} / 5.0 Average</span>
                </div>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {rev.reviewerName ? rev.reviewerName[0] : "U"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {rev.reviewerName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {rev.reviewerEmail}
                            </p>
                          </div>
                        </div>
                        <ProductRating rating={rev.rating} showCount={false} />
                      </div>

                      <p className="text-xs text-slate-600 italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No customer reviews available yet for this item.
                </div>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </AuthGuard>
  );
}
