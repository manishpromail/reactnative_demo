import { AxiosInstance } from 'axios';
import { ApiConstants } from '../../core/constants/api_constants';
import { NetworkHandling } from '../../core/network/network_handling';
import { ProductModel } from '../../features/products/data/product_model';
import { Injector } from '../injector';
import { DataResponse } from '../shared/data_response';

/**
 * ProductApiProvider handling remote product operations via Axios
 * Direct equivalent to Flutter's ProductApiProvider.
 */
export class ProductApiProvider {
  private get axios(): AxiosInstance {
    return Injector.getInstance().getAxios();
  }

  /**
   * Fetch all products
   */
  async getProducts(): Promise<DataResponse<ProductModel[]>> {
    try {
      const response = await this.axios.get(ApiConstants.products, {
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
   * Create a new product
   */
  async createProduct(params: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
  }): Promise<DataResponse<ProductModel>> {
    try {
      const response = await this.axios.post(
        ApiConstants.products,
        {
          title: params.title.trim(),
          description: params.description.trim(),
          price: params.price,
          image_url: params.imageUrl?.trim() || '',
        },
        {
          headers: Injector.getHeaderToken(),
        }
      );

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
}
