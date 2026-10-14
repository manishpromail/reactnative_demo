import { ProductApiProvider } from '../../../data/api_provider/product_api_provider';
import { CategoryModel } from './category_model';
import { ProductModel } from './product_model';
import { ReviewModel } from './review_model';

/**
 * ProductRepository coordinating product data fetching, mutations, and relational queries.
 */
export class ProductRepository {
  private readonly apiProvider: ProductApiProvider;

  constructor(apiProvider?: ProductApiProvider) {
    this.apiProvider = apiProvider ?? new ProductApiProvider();
  }

  async getProducts(categoryId?: string | number): Promise<ProductModel[]> {
    const response = await this.apiProvider.getProducts(categoryId);

    if (!response.isSuccess) {
      throw new Error(response.message || 'Failed to load products');
    }

    return response.data || [];
  }

  async getProductById(id: string | number): Promise<ProductModel> {
    const response = await this.apiProvider.getProductById(id);

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Failed to load product details');
    }

    return response.data;
  }

  async createProduct(params: {
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
  }): Promise<ProductModel> {
    const response = await this.apiProvider.createProduct(params);

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Failed to add product');
    }

    return response.data;
  }

  async addReview(
    productId: string | number,
    params: {
      userName: string;
      rating: number;
      comment: string;
    }
  ): Promise<ReviewModel> {
    const response = await this.apiProvider.addProductReview(productId, params);

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Failed to submit review');
    }

    return response.data;
  }

  async getCategories(): Promise<CategoryModel[]> {
    const response = await this.apiProvider.getCategories();

    if (!response.isSuccess) {
      throw new Error(response.message || 'Failed to load categories');
    }

    return response.data || [];
  }

  async getSchemaInfo(): Promise<any> {
    const response = await this.apiProvider.getSchemaInfo();
    return response.data;
  }
}
