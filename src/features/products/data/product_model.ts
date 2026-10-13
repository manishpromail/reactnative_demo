export interface ProductJson {
  id?: string | number;
  _id?: string | number;
  title?: string;
  description?: string;
  price?: number | string;
  image_url?: string;
  imageUrl?: string;
  created_at?: string;
  createdAt?: string;
}

export class ProductModel {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly imageUrl: string;
  readonly createdAt?: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    createdAt?: Date
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }

  static fromJson(json: ProductJson): ProductModel {
    const rawPrice = json.price != null ? Number(json.price) : 0;
    const rawDate = json.created_at || json.createdAt;

    return new ProductModel(
      String(json.id || json._id || ''),
      json.title || '',
      json.description || '',
      isNaN(rawPrice) ? 0 : rawPrice,
      json.image_url || json.imageUrl || '',
      rawDate ? new Date(rawDate) : undefined
    );
  }

  toJson(): ProductJson {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      price: this.price,
      image_url: this.imageUrl,
      created_at: this.createdAt ? this.createdAt.toISOString() : undefined,
    };
  }
}
