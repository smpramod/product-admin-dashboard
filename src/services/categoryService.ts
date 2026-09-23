import apiClient from "@/lib/axios";
import { CategoryItem } from "@/types";

export const categoryService = {
  /**
   * Fetch all product categories.
   * Normalizes response to CategoryItem[] whether API returns string array or object array.
   */
  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get<unknown[]>("/products/categories");
    const data = response.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => {
      if (typeof item === "string") {
        const formattedName = item
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return {
          slug: item,
          name: formattedName,
          url: `https://dummyjson.com/products/category/${item}`,
        };
      } else if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        return {
          slug: String(obj.slug || obj.name || ""),
          name: String(obj.name || obj.slug || ""),
          url: String(obj.url || ""),
        };
      }
      return {
        slug: String(item),
        name: String(item),
        url: "",
      };
    });
  },

  /**
   * Fetch simple category slugs list (/products/category-list)
   */
  async getCategoryList(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>("/products/category-list");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      // Fallback: extract slugs from getCategories
      const categories = await this.getCategories();
      return categories.map((c) => c.slug);
    }
  },
};

export default categoryService;
