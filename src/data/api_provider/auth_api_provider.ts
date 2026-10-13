import { AxiosInstance } from 'axios';
import { ApiConstants } from '../../core/constants/api_constants';
import { NetworkHandling } from '../../core/network/network_handling';
import { UserModel } from '../../features/auth/data/user_model';
import { Injector } from '../injector';
import { DataResponse } from '../shared/data_response';

/**
 * AuthApiProvider handling remote authentication requests via Axios
 * Direct equivalent to Flutter's AuthApiProvider.
 */
export class AuthApiProvider {
  private get axios(): AxiosInstance {
    return Injector.getInstance().getAxios();
  }

  /**
   * Register a new user
   */
  async signUp(params: {
    email: string;
    password: string;
    name?: string;
  }): Promise<DataResponse<UserModel>> {
    try {
      const response = await this.axios.post(ApiConstants.signup, {
        email: params.email.trim(),
        password: params.password.trim(),
        name: params.name?.trim() || '',
      });

      const body = response.data || {};
      const userData = body.user || body;
      const user = UserModel.fromJson(userData);

      return DataResponse.success(
        user,
        body.message || 'Signup successful',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<UserModel>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Sign in user
   */
  async logIn(params: {
    email: string;
    password: string;
  }): Promise<DataResponse<{ token?: string; user?: UserModel; [key: string]: any }>> {
    try {
      const response = await this.axios.post(ApiConstants.login, {
        email: params.email.trim(),
        password: params.password.trim(),
      });

      const body = response.data || {};
      const token = body.token;
      const userData = body.user || {};
      const user = UserModel.fromJson(userData);

      return DataResponse.success(
        { token, user, raw: body },
        body.message || 'Login successful',
        response.status
      );
    } catch (e) {
      return DataResponse.failure(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }

  /**
   * Fetch currently authenticated user profile
   */
  async getCurrentUser(): Promise<DataResponse<UserModel>> {
    try {
      const response = await this.axios.get(ApiConstants.profile, {
        headers: Injector.getHeaderToken(),
      });

      const body = response.data || {};
      const user = UserModel.fromJson(body.user || body);

      return DataResponse.success(
        user,
        'Profile fetched successfully',
        response.status
      );
    } catch (e) {
      return DataResponse.failure<UserModel>(
        NetworkHandling.getErrorMessage(e),
        undefined,
        NetworkHandling.getStatusCode(e)
      );
    }
  }
}
