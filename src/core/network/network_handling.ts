import axios, { AxiosError } from 'axios';

/**
 * Network error handling utility converting Axios and network exceptions
 * into user-friendly message strings (Direct equivalent to Flutter NetworkHandling).
 */
export class NetworkHandling {
  private constructor() {}

  static getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      // Check if backend returned structured error JSON
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        const msg = data.message || data.error;
        if (msg && typeof msg === 'string') {
          return msg;
        }
      }

      // Check Axios error codes / HTTP status
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return 'Connection timed out. The server might be waking up from sleep, please try again.';
      }

      if (!axiosError.response) {
        return 'Network connection error. Please check your internet connection or server availability.';
      }

      const status = axiosError.response.status;
      switch (status) {
        case 400:
          return 'Bad request. Please verify your inputs.';
        case 401:
          return 'Invalid credentials or session expired.';
        case 403:
          return 'Access forbidden.';
        case 404:
          return 'Requested resource not found.';
        case 408:
          return 'Request timed out.';
        case 500:
          return 'Internal server error. Please try again later.';
        case 502:
          return 'Bad gateway.';
        case 503:
          return 'Service unavailable.';
        default:
          return axiosError.response.statusText || `Something went wrong (${status})`;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }

  static getStatusCode(error: unknown): number {
    if (axios.isAxiosError(error)) {
      return error.response?.status ?? 0;
    }
    return 0;
  }
}
