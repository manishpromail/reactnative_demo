export interface CategoryJson {
  id?: string | number;
  _id?: string | number;
  name?: string;
  description?: string;
  color?: string;
  product_count?: number;
  productCount?: number;
}

export class CategoryModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly productCount: number;

  constructor(
    id: string,
    name: string,
    description: string,
    color: string,
    productCount: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.color = color;
    this.productCount = productCount;
  }

  static fromJson(json: CategoryJson): CategoryModel {
    return new CategoryModel(
      String(json.id || json._id || ''),
      json.name || '',
      json.description || '',
      json.color || '#2563EB',
      Number(json.product_count ?? json.productCount ?? 0)
    );
  }

  toJson(): CategoryJson {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      product_count: this.productCount,
    };
  }
}
