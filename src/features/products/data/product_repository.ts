import { ProductApiProvider } from '../../../data/api_provider/product_api_provider';
import { ProductModel } from './product_model';

/**
 * ProductRepository coordinating product data fetching and mutations.
 * Direct equivalent to Flutter's ProductRepository.
 */
export class ProductRepository {
  private readonly apiProvider: ProductApiProvider;

  constructor(apiProvider?: ProductApiProvider) {
    this.apiProvider = apiProvider ?? new ProductApiProvider();
  }

  async getProducts(): Promise<ProductModel[]> {
    const response = await this.apiProvider.getProducts();

    if (!response.isSuccess) {
      throw new Error(response.message || 'Failed to load products');
    }

    return response.data || [];
  }

  async createProduct(params: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
  }): Promise<ProductModel> {
    const response = await this.apiProvider.createProduct(params);

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Failed to add product');
    }

    return response.data;
  }
}
