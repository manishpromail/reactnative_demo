/**
 * Generic API Response container encapsulating API payload,
 * success status, and error messages uniformly.
 * Direct equivalent to Flutter DataResponse<T>.
 */
export class DataResponse<T> {
  readonly isSuccess: boolean;
  readonly message?: string;
  readonly error?: string;
  readonly data?: T;
  readonly statusCode?: number;

  constructor(params: {
    isSuccess: boolean;
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
  }) {
    this.isSuccess = params.isSuccess;
    this.data = params.data;
    this.message = params.message;
    this.error = params.error;
    this.statusCode = params.statusCode;
  }

  static success<T>(data: T, message?: string, statusCode: number = 200): DataResponse<T> {
    return new DataResponse<T>({
      isSuccess: true,
      data,
      message,
      statusCode,
    });
  }

  static failure<T>(message: string, error?: string, statusCode?: number): DataResponse<T> {
    return new DataResponse<T>({
      isSuccess: false,
      message,
      error,
      statusCode,
    });
  }
}
