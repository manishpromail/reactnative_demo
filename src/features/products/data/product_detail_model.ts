export interface ProductDetailJson {
  id?: string | number;
  product_id?: string | number;
  productId?: string | number;
  sku?: string;
  warranty_months?: number | string;
  warrantyMonths?: number | string;
  manufacturer?: string;
  weight_kg?: number | string;
  weightKg?: number | string;
  dimensions?: string;
  origin_country?: string;
  originCountry?: string;
  created_at?: string;
}

export class ProductDetailModel {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly warrantyMonths: number;
  readonly manufacturer: string;
  readonly weightKg: number;
  readonly dimensions: string;
  readonly originCountry: string;
  readonly createdAt?: Date;

  constructor(
    id: string,
    productId: string,
    sku: string,
    warrantyMonths: number,
    manufacturer: string,
    weightKg: number,
    dimensions: string,
    originCountry: string,
    createdAt?: Date
  ) {
    this.id = id;
    this.productId = productId;
    this.sku = sku;
    this.warrantyMonths = warrantyMonths;
    this.manufacturer = manufacturer;
    this.weightKg = weightKg;
    this.dimensions = dimensions;
    this.originCountry = originCountry;
    this.createdAt = createdAt;
  }

  static fromJson(json: ProductDetailJson): ProductDetailModel {
    return new ProductDetailModel(
      String(json.id || ''),
      String(json.product_id || json.productId || ''),
      json.sku || '',
      Number(json.warranty_months ?? json.warrantyMonths ?? 12),
      json.manufacturer || 'General Manufacturer',
      Number(json.weight_kg ?? json.weightKg ?? 0.5),
      json.dimensions || 'N/A',
      json.origin_country || json.originCountry || 'United States',
      json.created_at ? new Date(json.created_at) : undefined
    );
  }

  toJson(): ProductDetailJson {
    return {
      id: this.id,
      product_id: this.productId,
      sku: this.sku,
      warranty_months: this.warrantyMonths,
      manufacturer: this.manufacturer,
      weight_kg: this.weightKg,
      dimensions: this.dimensions,
      origin_country: this.originCountry,
      created_at: this.createdAt ? this.createdAt.toISOString() : undefined,
    };
  }
}
