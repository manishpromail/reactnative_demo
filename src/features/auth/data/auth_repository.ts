import { AuthApiProvider } from '../../../data/api_provider/auth_api_provider';
import { StorageHelper } from '../../../utils/helper/storage_helper';
import { UserModel } from './user_model';

/**
 * AuthRepository coordinating API communication and storage persistence.
 * Direct equivalent to Flutter's AuthRepository.
 */
export class AuthRepository {
  private readonly apiProvider: AuthApiProvider;

  constructor(apiProvider?: AuthApiProvider) {
    this.apiProvider = apiProvider ?? new AuthApiProvider();
  }

  async signup(params: {
    email: string;
    password: string;
    name?: string;
  }): Promise<void> {
    const response = await this.apiProvider.signUp(params);

    if (!response.isSuccess) {
      throw new Error(response.message || 'Signup failed');
    }
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<UserModel> {
    const response = await this.apiProvider.logIn(params);

    if (!response.isSuccess) {
      throw new Error(response.message || 'Login failed');
    }

    const data = response.data;
    const token = data?.token;
    const user = data?.user;

    if (!token || !user) {
      throw new Error('Invalid response format from server');
    }

    // Save session in StorageHelper
    const storage = StorageHelper.getInstance();
    await storage.saveUserToken(token);
    await storage.saveUserModel(user);
    await storage.saveIsLoggedIn(true);

    return user;
  }

  async getSavedUser(): Promise<UserModel | null> {
    const storage = StorageHelper.getInstance();
    const isLoggedIn = storage.isLoggedIn();
    if (!isLoggedIn) return null;
    return storage.getUserModel();
  }

  async logout(): Promise<void> {
    await StorageHelper.getInstance().clearAll();
  }
}
