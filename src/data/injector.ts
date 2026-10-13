import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiConstants } from '../core/constants/api_constants';
import { NetworkHandling } from '../core/network/network_handling';
import { StorageHelper } from '../utils/helper/storage_helper';

/**
 * Injector singleton configuring Axios instance with timeouts,
 * logging interceptors, and auth headers.
 * Direct equivalent to Flutter's Injector (Dio) class.
 */
export class Injector {
  private static instance: Injector;
  private static axiosInstance: AxiosInstance;

  private constructor() {
    Injector.axiosInstance = axios.create({
      baseURL: ApiConstants.baseUrl,
      timeout: ApiConstants.connectTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Logging & Auth Interceptor (equivalent to Dio InterceptorsWrapper in Flutter)
    Injector.axiosInstance.interceptors.request.use(
      (config) => {
        const token = StorageHelper.getInstance().getUserToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[HTTP Request] --> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.log('[HTTP Request Error]', error);
        return Promise.reject(error);
      }
    );

    Injector.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`[HTTP Response] <-- ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.log(`[HTTP Response Error] <-- ${error.response?.status} ${error.config?.url}: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): Injector {
    if (!Injector.instance) {
      Injector.instance = new Injector();
    }
    return Injector.instance;
  }

  getAxios(): AxiosInstance {
    Injector.axiosInstance.defaults.baseURL = ApiConstants.baseUrl;
    return Injector.axiosInstance;
  }

  /**
   * Updates the baseUrl on the existing Axios instance immediately
   */
  static updateBaseUrl(): void {
    if (Injector.axiosInstance) {
      Injector.axiosInstance.defaults.baseURL = ApiConstants.baseUrl;
    }
  }

  /**
   * Pings an endpoint healthcheck to verify reachability
   */
  static async testConnection(targetBaseUrl: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const cleanUrl = targetBaseUrl.endsWith('/')
      ? targetBaseUrl.slice(0, -1)
      : targetBaseUrl;

    try {
      const response = await axios.get(`${cleanUrl}${ApiConstants.health}`, {
        timeout: 10000,
      });

      if (response.status === 200) {
        return {
          success: true,
          message: 'Connected successfully',
          data: response.data,
        };
      }
      return {
        success: false,
        message: `Server returned code ${response.status}`,
      };
    } catch (e) {
      return {
        success: false,
        message: NetworkHandling.getErrorMessage(e),
      };
    }
  }

  static getHeaderToken(): AxiosRequestConfig['headers'] {
    const token = StorageHelper.getInstance().getUserToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }
}
