import apiClient from "@/lib/axios";
import { Product, ProductsResponse } from "@/types";

export interface GetProductsParams {
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  delay?: number; // for testing simulated latency (e.g. &delay=2000)
}

export interface SearchProductsParams extends GetProductsParams {
  query: string;
  signal?: AbortSignal;
}

export interface CategoryProductsParams extends GetProductsParams {
  category: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand?: string;
  discountPercentage?: number;
  thumbnail?: string;
  images?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id?: number;
}

export const productService = {
  /**
   * Fetch paginated list of products with optional sorting
   */
  async getProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, sortBy, order, delay } = params;
    const queryParams: Record<string, string | number> = {
      limit,
      skip,
    };

    if (sortBy) queryParams.sortBy = sortBy;
    if (order) queryParams.order = order;
    if (delay) queryParams.delay = delay;

    const response = await apiClient.get<ProductsResponse>("/products", {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Search products with query, pagination, sorting and AbortSignal support
   * for eliminating search race conditions
   */
  async searchProducts(params: SearchProductsParams): Promise<ProductsResponse> {
    const { query, limit = 10, skip = 0, sortBy, order, delay, signal } = params;
    const queryParams: Record<string, string | number> = {
      q: query,
      limit,
      skip,
    };

    if (sortBy) queryParams.sortBy = sortBy;
    if (order) queryParams.order = order;
    if (delay) queryParams.delay = delay;

    const response = await apiClient.get<ProductsResponse>("/products/search", {
      params: queryParams,
      signal, // Cancel older in-flight requests if user types faster
    });
    return response.data;
  },

  /**
   * Fetch products filtered by a specific category
   */
  async getProductsByCategory(params: CategoryProductsParams): Promise<ProductsResponse> {
    const { category, limit = 10, skip = 0, sortBy, order, delay } = params;
    const queryParams: Record<string, string | number> = {
      limit,
      skip,
    };

    if (sortBy) queryParams.sortBy = sortBy;
    if (order) queryParams.order = order;
    if (delay) queryParams.delay = delay;

    const encodedCategory = encodeURIComponent(category);
    const response = await apiClient.get<ProductsResponse>(`/products/category/${encodedCategory}`, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Fetch a single product by its ID
   */
  async getProductById(id: number | string, delay?: number): Promise<Product> {
    const queryParams: Record<string, number> = {};
    if (delay) queryParams.delay = delay;

    const response = await apiClient.get<Product>(`/products/${id}`, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Add a new product (DummyJSON POST /products/add)
   */
  async addProduct(product: CreateProductInput): Promise<Product> {
    const response = await apiClient.post<Product>("/products/add", product);
    return response.data;
  },

  /**
   * Update an existing product (DummyJSON PUT /products/{id})
   */
  async updateProduct(id: number, product: UpdateProductInput): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  /**
   * Delete a product (DummyJSON DELETE /products/{id})
   */
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
