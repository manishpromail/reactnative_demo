import { AxiosInstance } from 'axios';
import { ApiConstants } from '../../core/constants/api_constants';
import { NetworkHandling } from '../../core/network/network_handling';
import { CategoryModel } from '../../features/products/data/category_model';
import { ProductModel } from '../../features/products/data/product_model';
import { ReviewModel } from '../../features/products/data/review_model';
import { Injector } from '../injector';
import { DataResponse } from '../shared/data_response';

/**
 * ProductApiProvider handling remote product & relational database operations via Axios
 */
export class ProductApiProvider {
  private get axios(): AxiosInstance {
    return Injector.getInstance().getAxios();
  }

  /**
   * Fetch all products (optional category filter)
   */
  async getProducts(categoryId?: string | number): Promise<DataResponse<ProductModel[]>> {
    try {
      const url = categoryId
        ? `${ApiConstants.products}?category_id=${categoryId}`
        : ApiConstants.products;

      const response = await this.axios.get(url, {
        headers: Injector.getHeaderToken(),
      });

      const body = response.data || {};
      const rawList = Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
        ? body
        : [];

      const products = rawList.map((item: any) => ProductModel.fromJson(item));

      return DataResponse.success(
        products,
        body.message || 'Products loaded',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<ProductModel[]>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Fetch single product with all relationships (1:1 details, 1:M reviews, M:M categories)
   */
  async getProductById(id: string | number): Promise<DataResponse<ProductModel>> {
    try {
      const response = await this.axios.get(ApiConstants.productDetail(id), {
        headers: Injector.getHeaderToken(),
      });

      const body = response.data || {};
      const itemData = body.data || body;
      const product = ProductModel.fromJson(itemData);

      return DataResponse.success(
        product,
        body.message || 'Product details loaded',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<ProductModel>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Create a new product with optional 1:1 specs and M:M categories
   */
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
  }): Promise<DataResponse<ProductModel>> {
    try {
      const payload: any = {
        title: params.title.trim(),
        description: params.description.trim(),
        price: params.price,
        image_url: params.imageUrl?.trim() || '',
      };

      if (params.productDetails) {
        payload.product_details = {
          sku: params.productDetails.sku,
          warranty_months: params.productDetails.warrantyMonths ?? 12,
          manufacturer: params.productDetails.manufacturer,
          weight_kg: params.productDetails.weightKg,
          dimensions: params.productDetails.dimensions,
          origin_country: params.productDetails.originCountry,
        };
      }

      if (params.categoryIds && params.categoryIds.length > 0) {
        payload.category_ids = params.categoryIds;
      }

      const response = await this.axios.post(ApiConstants.products, payload, {
        headers: Injector.getHeaderToken(),
      });

      const body = response.data || {};
      const itemData = body.data || body;
      const product = ProductModel.fromJson(itemData);

      return DataResponse.success(
        product,
        body.message || 'Product added successfully',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<ProductModel>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Add a review (1:M Relationship)
   */
  async addProductReview(
    productId: string | number,
    params: {
      userName: string;
      rating: number;
      comment: string;
    }
  ): Promise<DataResponse<ReviewModel>> {
    try {
      const response = await this.axios.post(
        ApiConstants.productReviews(productId),
        {
          user_name: params.userName.trim(),
          rating: params.rating,
          comment: params.comment.trim(),
        },
        {
          headers: Injector.getHeaderToken(),
        }
      );

      const body = response.data || {};
      const reviewData = body.data || body;
      const review = ReviewModel.fromJson(reviewData);

      return DataResponse.success(
        review,
        body.message || 'Review added successfully',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<ReviewModel>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Fetch all categories (M:M relationship lookup)
   */
  async getCategories(): Promise<DataResponse<CategoryModel[]>> {
    try {
      const response = await this.axios.get(ApiConstants.categories, {
        headers: Injector.getHeaderToken(),
      });

      const body = response.data || {};
      const rawList = Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
        ? body
        : [];

      const categories = rawList.map((item: any) => CategoryModel.fromJson(item));

      return DataResponse.success(
        categories,
        body.message || 'Categories loaded',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<CategoryModel[]>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Fetch live schema status & educational relationship definitions
   */
  async getSchemaInfo(): Promise<DataResponse<any>> {
    try {
      const response = await this.axios.get(ApiConstants.schemaInfo);
      return DataResponse.success(response.data);
    } catch (e) {
      return DataResponse.failure(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }
}
