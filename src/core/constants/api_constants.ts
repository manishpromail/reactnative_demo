export enum BackendType {
  SUPABASE = 'supabase',
  MONGODB = 'mongodb',
}

export interface BackendInfo {
  type: BackendType;
  displayName: string;
  shortName: string;
  defaultUrl: string;
  description: string;
}

export const BACKEND_DETAILS: Record<BackendType, BackendInfo> = {
  [BackendType.SUPABASE]: {
    type: BackendType.SUPABASE,
    displayName: 'Supabase (PostgreSQL)',
    shortName: 'Supabase',
    defaultUrl: 'https://flutter-supabase-backend-bdv6.onrender.com',
    description: 'Relational database powered by PostgreSQL & Supabase REST API.',
  },
  [BackendType.MONGODB]: {
    type: BackendType.MONGODB,
    displayName: 'MongoDB (NoSQL)',
    shortName: 'MongoDB',
    defaultUrl: 'https://flutter-mongodb.onrender.com',
    description: 'Document NoSQL database powered by MongoDB Atlas & Mongoose.',
  },
};

export class ApiConstants {
  // 45s to allow for free tier Render cold starts
  static readonly connectTimeoutMs = 45000;
  static readonly receiveTimeoutMs = 30000;

  // Active backend configuration
  static activeBackend: BackendType = BackendType.SUPABASE;
  private static _customUrl: string | null = null;

  static get baseUrl(): string {
    return this._customUrl ?? BACKEND_DETAILS[this.activeBackend].defaultUrl;
  }

  static get customUrl(): string | null {
    return this._customUrl;
  }

  static setBackend(type: BackendType, customUrl?: string | null): void {
    this.activeBackend = type;
    if (customUrl && customUrl.trim().length > 0) {
      this._customUrl = customUrl.trim();
    } else {
      this._customUrl = null;
    }
  }

  // Endpoints
  static readonly signup = '/api/auth/signup';
  static readonly login = '/api/auth/login';
  static readonly profile = '/api/auth/me';
  static readonly products = '/api/products';
  static readonly health = '/api/health';
}
