import React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { ProductRating } from "./ProductRating";
import { StockBadge } from "./StockBadge";
import { formatCurrency } from "@/lib/utils";
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Package
} from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          
          {/* Table Header */}
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3">Product</th>
              <th scope="col" className="px-3 py-3.5">Category</th>
              <th scope="col" className="px-3 py-3.5">Price</th>
              <th scope="col" className="px-3 py-3.5">Rating</th>
              <th scope="col" className="px-3 py-3.5">Stock</th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => {
              const mainImage = product.thumbnail || (product.images && product.images[0]) || "";
              
              return (
                <tr 
                  key={product.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Product Info (Thumbnail + Title + Brand) */}
                  <td className="py-3.5 pl-6 pr-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={product.title}
                            className="h-full w-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400" />
                        )}
                        {product.isLocalMock && (
                          <span 
                            title="Locally added/updated item"
                            className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"
                          />
                        )}
                      </div>
                      
                      <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 flex items-center gap-1"
                        >
                          <span>{product.title}</span>
                        </Link>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {product.brand ? product.brand : "Generic"} • SKU: {product.sku || `#${product.id}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 capitalize border border-slate-200/60">
                      {product.category.replace(/-/g, " ")}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 ? (
                        <span className="text-[10px] font-medium text-emerald-600">
                          {product.discountPercentage}% off
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <ProductRating 
                      rating={product.rating} 
                      reviewsCount={product.reviews?.length} 
                    />
                  </td>

                  {/* Stock */}
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <StockBadge stock={product.stock} />
                  </td>

                  {/* Action Buttons */}
                  <td className="whitespace-nowrap py-3.5 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Edit Button */}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 active:scale-95 transition-all"
                          title="Edit Product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete Button */}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(product)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
