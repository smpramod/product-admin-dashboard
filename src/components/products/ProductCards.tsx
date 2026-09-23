import React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { ProductRating } from "./ProductRating";
import { StockBadge } from "./StockBadge";
import { formatCurrency } from "@/lib/utils";
import { Eye, Edit3, Trash2, Package } from "lucide-react";

interface ProductCardsProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCards({ products, onEdit, onDelete }: ProductCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:hidden">
      {products.map((product) => {
        const mainImage = product.thumbnail || (product.images && product.images[0]) || "";

        return (
          <div
            key={product.id}
            className="glass-card rounded-2xl p-4 transition-all shadow-xs hover:shadow-card flex flex-col justify-between gap-3 border border-slate-200"
          >
            {/* Card Header: Thumbnail + Main Info */}
            <div className="flex items-start gap-3.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <Package className="h-6 w-6 text-slate-400" />
                )}
                {product.isLocalMock && (
                  <span
                    title="Locally added/updated item"
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 capitalize">
                    {product.category.replace(/-/g, " ")}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #{product.id}
                  </span>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 mt-1 block"
                >
                  {product.title}
                </Link>

                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {product.brand ? product.brand : "Generic"}
                </p>
              </div>
            </div>

            {/* Middle Stats: Price + Rating + Stock */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-base font-extrabold text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                {product.discountPercentage && product.discountPercentage > 0 ? (
                  <span className="text-[10px] font-medium text-emerald-600 ml-1.5">
                    ({product.discountPercentage}% off)
                  </span>
                ) : null}
              </div>

              <StockBadge stock={product.stock} />
            </div>

            {/* Bottom Row: Rating + Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <ProductRating
                rating={product.rating}
                reviewsCount={product.reviews?.length}
              />

              <div className="flex items-center gap-1">
                <Link
                  href={`/products/${product.id}`}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Link>

                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 active:scale-95 transition"
                    title="Edit Product"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
