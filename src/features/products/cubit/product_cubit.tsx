import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CategoryModel } from '../data/category_model';
import { ProductModel } from '../data/product_model';
import { ProductRepository } from '../data/product_repository';
import { ReviewModel } from '../data/review_model';
import { ProductState } from './product_state';

interface ProductContextValue {
  state: ProductState;
  currentProducts: ProductModel[];
  categories: CategoryModel[];
  selectedCategory: CategoryModel | null;
  fetchProducts: (categoryId?: string | number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  selectCategory: (category: CategoryModel | null) => void;
  fetchProductById: (id: string | number) => Promise<ProductModel | null>;
  addProduct: (params: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    productDetails?: {
      sku: string;
      warrantyMonths?: number;
      manufacturer?: string;
      weightKg?: number;
      dimensions?: string;
      originCountry?: string;
    };
    categoryIds?: (string | number)[];
  }) => Promise<boolean>;
  addReview: (
    productId: string | number,
    params: {
      userName: string;
      rating: number;
      comment: string;
    }
  ) => Promise<ReviewModel | null>;
  resetError: () => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

const productRepository = new ProductRepository();

/**
 * ProductProvider / ProductCubit in React Native.
 * Coordinates product catalog, categories (M:M), reviews (1:M), and specs (1:1).
 */
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProductState>({ type: 'initial' });
  const [cachedProducts, setCachedProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await productRepository.getCategories();
      setCategories(cats);
    } catch (e: any) {
      console.warn('Could not fetch categories:', e.message);
    }
  }, []);

  const fetchProducts = useCallback(async (categoryId?: string | number) => {
    setState({ type: 'loading' });
    try {
      const products = await productRepository.getProducts(categoryId);
      setCachedProducts(products);
      setState({ type: 'loaded', products });
    } catch (e: any) {
      setState({
        type: 'error',
        message: e.message?.replace('Exception: ', '') || 'Failed to load products',
      });
    }
  }, []);

  const selectCategory = useCallback(
    (cat: CategoryModel | null) => {
      setSelectedCategory(cat);
      fetchProducts(cat ? cat.id : undefined);
    },
    [fetchProducts]
  );

  const fetchProductById = useCallback(async (id: string | number): Promise<ProductModel | null> => {
    try {
      return await productRepository.getProductById(id);
    } catch (e: any) {
      console.warn('Failed to load product by id:', e.message);
      return null;
    }
  }, []);

  const addProduct = useCallback(
    async (params: {
      title: string;
      description: string;
      price: number;
      imageUrl?: string;
      productDetails?: {
        sku: string;
        warrantyMonths?: number;
        manufacturer?: string;
        weightKg?: number;
        dimensions?: string;
        originCountry?: string;
      };
      categoryIds?: (string | number)[];
    }): Promise<boolean> => {
      setState({ type: 'actionInProgress' });
      try {
        const newProduct = await productRepository.createProduct(params);
        setCachedProducts((prev) => {
          const updated = [newProduct, ...prev];
          setState({ type: 'loaded', products: updated });
          return updated;
        });
        // Also refresh categories to reflect updated counts
        fetchCategories();
        return true;
      } catch (e: any) {
        const msg = e.message?.replace('Exception: ', '') || 'Failed to add product';
        setState({ type: 'error', message: msg });
        return false;
      }
    },
    [fetchCategories]
  );

  const addReview = useCallback(
    async (
      productId: string | number,
      params: {
        userName: string;
        rating: number;
        comment: string;
      }
    ): Promise<ReviewModel | null> => {
      try {
        const newReview = await productRepository.addReview(productId, params);
        // Refresh products cache so reviewCount & rating are fresh
        fetchProducts(selectedCategory ? selectedCategory.id : undefined);
        return newReview;
      } catch (e: any) {
        console.warn('Failed to add review:', e.message);
        throw e;
      }
    },
    [fetchProducts, selectedCategory]
  );

  const resetError = useCallback(() => {
    setState({ type: 'loaded', products: cachedProducts });
  }, [cachedProducts]);

  return (
    <ProductContext.Provider
      value={{
        state,
        currentProducts: cachedProducts,
        categories,
        selectedCategory,
        fetchProducts,
        fetchCategories,
        selectCategory,
        fetchProductById,
        addProduct,
        addReview,
        resetError,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
