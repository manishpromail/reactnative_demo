import React, { createContext, useContext, useState, useCallback } from 'react';
import { ProductModel } from '../data/product_model';
import { ProductRepository } from '../data/product_repository';
import { ProductState } from './product_state';

interface ProductContextValue {
  state: ProductState;
  currentProducts: ProductModel[];
  fetchProducts: () => Promise<void>;
  addProduct: (params: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
  }) => Promise<boolean>;
  resetError: () => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

const productRepository = new ProductRepository();

/**
 * ProductProvider / ProductCubit equivalent in React Native.
 * Replicates Flutter's BlocProvider<ProductCubit> & Cubit<ProductState>.
 */
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProductState>({ type: 'initial' });
  const [cachedProducts, setCachedProducts] = useState<ProductModel[]>([]);

  const fetchProducts = useCallback(async () => {
    setState({ type: 'loading' });
    try {
      const products = await productRepository.getProducts();
      setCachedProducts(products);
      setState({ type: 'loaded', products });
    } catch (e: any) {
      setState({
        type: 'error',
        message: e.message?.replace('Exception: ', '') || 'Failed to load products',
      });
    }
  }, []);

  const addProduct = useCallback(
    async (params: {
      title: string;
      description: string;
      price: number;
      imageUrl?: string;
    }): Promise<boolean> => {
      setState({ type: 'actionInProgress' });
      try {
        const newProduct = await productRepository.createProduct(params);
        setCachedProducts((prev) => {
          const updated = [newProduct, ...prev];
          setState({ type: 'loaded', products: updated });
          return updated;
        });
        return true;
      } catch (e: any) {
        const msg = e.message?.replace('Exception: ', '') || 'Failed to add product';
        setState({ type: 'error', message: msg });
        return false;
      }
    },
    []
  );

  const resetError = useCallback(() => {
    setState({ type: 'loaded', products: cachedProducts });
  }, [cachedProducts]);

  return (
    <ProductContext.Provider
      value={{
        state,
        currentProducts: cachedProducts,
        fetchProducts,
        addProduct,
        resetError,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

/**
 * Hook equivalent to context.read<ProductCubit>() or BlocBuilder<ProductCubit, ProductState> in Flutter.
 */
export const useProducts = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
