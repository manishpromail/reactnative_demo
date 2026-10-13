import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiConstants, BackendType } from '../../core/constants/api_constants';
import { UserModel } from '../../features/auth/data/user_model';

/**
 * StorageHelper singleton for session and backend configuration persistence.
 * Mirrors Flutter's StorageHelper class using AsyncStorage with an in-memory cache.
 */
export class StorageHelper {
  private static instance: StorageHelper;
  private static cache: Map<string, string> = new Map();

  private static readonly SELECTED_BACKEND_KEY = 'selected_backend_type';
  private static readonly CUSTOM_URL_KEY_PREFIX = 'custom_backend_url_';

  private constructor() {}

  static getInstance(): StorageHelper {
    if (!StorageHelper.instance) {
      StorageHelper.instance = new StorageHelper();
    }
    return StorageHelper.instance;
  }

  /**
   * Initializes the in-memory cache from AsyncStorage.
   * Equivalent to `await StorageHelper.init()` in Flutter `main()`.
   */
  static async init(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
      for (const [key, value] of entries) {
        if (value !== null) {
          StorageHelper.cache.set(key, value);
        }
      }
    } catch (e) {
      console.warn('StorageHelper init error:', e);
    }
  }

  // --- Backend Configuration Persistence ---

  hasSelectedBackend(): boolean {
    return StorageHelper.cache.has(StorageHelper.SELECTED_BACKEND_KEY);
  }

  getSelectedBackend(): BackendType | null {
    const val = StorageHelper.cache.get(StorageHelper.SELECTED_BACKEND_KEY);
    if (!val) return null;
    if (val === BackendType.SUPABASE || val === BackendType.MONGODB) {
      return val as BackendType;
    }
    return null;
  }

  async saveSelectedBackend(type: BackendType): Promise<void> {
    StorageHelper.cache.set(StorageHelper.SELECTED_BACKEND_KEY, type);
    await AsyncStorage.setItem(StorageHelper.SELECTED_BACKEND_KEY, type);
  }

  getCustomBackendUrl(type: BackendType): string | null {
    const key = `${StorageHelper.CUSTOM_URL_KEY_PREFIX}${type}`;
    return StorageHelper.cache.get(key) ?? null;
  }

  async saveCustomBackendUrl(type: BackendType, url?: string | null): Promise<void> {
    const key = `${StorageHelper.CUSTOM_URL_KEY_PREFIX}${type}`;
    if (!url || url.trim().length === 0) {
      StorageHelper.cache.delete(key);
      await AsyncStorage.removeItem(key);
    } else {
      StorageHelper.cache.set(key, url.trim());
      await AsyncStorage.setItem(key, url.trim());
    }
  }

  // --- Scoped Key Helpers (Session per backend) ---

  private tokenKey(backend?: BackendType): string {
    return `userToken_${backend ?? ApiConstants.activeBackend}`;
  }

  private userKey(backend?: BackendType): string {
    return `userModel_${backend ?? ApiConstants.activeBackend}`;
  }

  private idKey(backend?: BackendType): string {
    return `userId_${backend ?? ApiConstants.activeBackend}`;
  }

  private loginKey(backend?: BackendType): string {
    return `isLoggedIn_${backend ?? ApiConstants.activeBackend}`;
  }

  // --- User Token ---

  async saveUserToken(token?: string | null, backend?: BackendType): Promise<void> {
    const key = this.tokenKey(backend);
    if (!token) {
      StorageHelper.cache.delete(key);
      await AsyncStorage.removeItem(key);
    } else {
      StorageHelper.cache.set(key, token);
      await AsyncStorage.setItem(key, token);
    }
  }

  getUserToken(backend?: BackendType): string | null {
    return StorageHelper.cache.get(this.tokenKey(backend)) ?? null;
  }

  // --- User ID ---

  async saveUserId(id?: string | null, backend?: BackendType): Promise<void> {
    const key = this.idKey(backend);
    if (!id) {
      StorageHelper.cache.delete(key);
      await AsyncStorage.removeItem(key);
    } else {
      StorageHelper.cache.set(key, id);
      await AsyncStorage.setItem(key, id);
    }
  }

  getUserId(backend?: BackendType): string | null {
    return StorageHelper.cache.get(this.idKey(backend)) ?? null;
  }

  // --- Logged In Status ---

  async saveIsLoggedIn(value: boolean, backend?: BackendType): Promise<void> {
    const key = this.loginKey(backend);
    StorageHelper.cache.set(key, String(value));
    await AsyncStorage.setItem(key, String(value));
  }

  isLoggedIn(backend?: BackendType): boolean {
    const token = this.getUserToken(backend);
    const key = this.loginKey(backend);
    const val = StorageHelper.cache.get(key);
    return Boolean((token && token.length > 0) || val === 'true');
  }

  // --- User Model ---

  async saveUserModel(user?: UserModel | null, backend?: BackendType): Promise<void> {
    const key = this.userKey(backend);
    if (!user) {
      StorageHelper.cache.delete(key);
      await AsyncStorage.removeItem(key);
    } else {
      const jsonStr = JSON.stringify(user.toJson());
      StorageHelper.cache.set(key, jsonStr);
      await AsyncStorage.setItem(key, jsonStr);
    }
  }

  getUserModel(backend?: BackendType): UserModel | null {
    const key = this.userKey(backend);
    const jsonStr = StorageHelper.cache.get(key);
    if (!jsonStr) return null;
    try {
      const parsed = JSON.parse(jsonStr);
      return UserModel.fromJson(parsed);
    } catch {
      return null;
    }
  }

  // --- Clear / Logout ---

  async clearAll(backend?: BackendType): Promise<void> {
    const tKey = this.tokenKey(backend);
    const uKey = this.userKey(backend);
    const iKey = this.idKey(backend);
    const lKey = this.loginKey(backend);

    StorageHelper.cache.delete(tKey);
    StorageHelper.cache.delete(uKey);
    StorageHelper.cache.delete(iKey);
    StorageHelper.cache.delete(lKey);

    await AsyncStorage.multiRemove([tKey, uKey, iKey, lKey]);
  }
}
