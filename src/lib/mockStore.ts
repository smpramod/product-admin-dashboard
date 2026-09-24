import { Product, CreateProductInput, UpdateProductInput } from "@/types";
import { STORAGE_KEYS, DEFAULT_PRODUCT_THUMBNAIL } from "@/constants";

export const mockStore = {
  /**
   * Get all locally added products
   */
  getAddedProducts(): Product[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOCK_ADDED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Add a locally created product
   */
  saveAddedProduct(input: CreateProductInput & { id?: number }): Product {
    const existing = this.getAddedProducts();
    const newId = input.id || Date.now(); // Generate a unique mock ID

    const newProduct: Product = {
      id: newId,
      title: input.title,
      description: input.description,
      price: Number(input.price),
      category: input.category,
      stock: Number(input.stock),
      brand: input.brand || "Custom Brand",
      discountPercentage: input.discountPercentage ? Number(input.discountPercentage) : 0,
      rating: 5.0, // Default 5.0 for newly added products
      thumbnail: input.thumbnail || DEFAULT_PRODUCT_THUMBNAIL,
      images: input.images?.length
        ? input.images
        : [input.thumbnail || DEFAULT_PRODUCT_THUMBNAIL],
      isLocalMock: true,
      reviews: [
        {
          rating: 5,
          comment: "Newly added product (Local Store Overlay)",
          date: new Date().toISOString(),
          reviewerName: "Admin User",
          reviewerEmail: "admin@adminpulse.dev",
        },
      ],
    };

    const updated = [newProduct, ...existing];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.MOCK_ADDED, JSON.stringify(updated));
    }
    return newProduct;
  },

  /**
   * Get all locally edited product overrides
   */
  getEditedProducts(): Record<number, Partial<Product>> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOCK_EDITED);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  /**
   * Save an update for an existing product
   */
  saveEditedProduct(id: number, updates: UpdateProductInput): void {
    if (typeof window === "undefined") return;
    
    // If it's a locally added product, update it in the added list directly
    const addedList = this.getAddedProducts();
    const isAdded = addedList.some((p) => p.id === id);

    if (isAdded) {
      const updatedAdded = addedList.map((p) =>
        p.id === id ? { ...p, ...updates, isLocalMock: true } : p
      );
      localStorage.setItem(STORAGE_KEYS.MOCK_ADDED, JSON.stringify(updatedAdded));
      return;
    }

    // Otherwise save override for standard API product
    const editedMap = this.getEditedProducts();
    editedMap[id] = {
      ...(editedMap[id] || {}),
      ...updates,
      isLocalMock: true,
    };
    localStorage.setItem(STORAGE_KEYS.MOCK_EDITED, JSON.stringify(editedMap));
  },

  /**
   * Get all locally deleted product IDs
   */
  getDeletedProductIds(): number[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOCK_DELETED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Mark a product ID as locally deleted
   */
  saveDeletedProductId(id: number): void {
    if (typeof window === "undefined") return;

    // If it was in locally added list, remove from added list
    const addedList = this.getAddedProducts();
    const filteredAdded = addedList.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.MOCK_ADDED, JSON.stringify(filteredAdded));

    // Also track in deleted IDs list
    const deletedList = this.getDeletedProductIds();
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      localStorage.setItem(STORAGE_KEYS.MOCK_DELETED, JSON.stringify(deletedList));
    }
  },

  /**
   * Apply local mock overlay onto a list of API products
   */
  applyOverlayToList(apiProducts: Product[]): Product[] {
    const deletedIds = new Set(this.getDeletedProductIds());
    const editedMap = this.getEditedProducts();
    const addedProducts = this.getAddedProducts();

    // Filter out deleted IDs and apply edits
    const mergedApi = apiProducts
      .filter((p) => !deletedIds.has(p.id))
      .map((p) => {
        if (editedMap[p.id]) {
          return { ...p, ...editedMap[p.id] };
        }
        return p;
      });

    // Merge locally added products that aren't deleted
    const validAdded = addedProducts.filter((p) => !deletedIds.has(p.id));

    return [...validAdded, ...mergedApi];
  },

  /**
   * Apply local overlay onto a single product
   */
  applyOverlayToSingle(id: number, apiProduct: Product | null): Product | null {
    const deletedIds = new Set(this.getDeletedProductIds());
    if (deletedIds.has(id)) return null;

    // Check if it's a locally added product
    const addedList = this.getAddedProducts();
    const addedMatch = addedList.find((p) => p.id === id);
    if (addedMatch) return addedMatch;

    if (!apiProduct) return null;

    const editedMap = this.getEditedProducts();
    if (editedMap[id]) {
      return { ...apiProduct, ...editedMap[id] };
    }

    return apiProduct;
  },
};

export default mockStore;
