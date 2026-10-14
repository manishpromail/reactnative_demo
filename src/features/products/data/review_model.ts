export interface ReviewJson {
  id?: string | number;
  product_id?: string | number;
  productId?: string | number;
  user_name?: string;
  userName?: string;
  rating?: number | string;
  comment?: string;
  created_at?: string;
  createdAt?: string;
}

export class ReviewModel {
  readonly id: string;
  readonly productId: string;
  readonly userName: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt?: Date;

  constructor(
    id: string,
    productId: string,
    userName: string,
    rating: number,
    comment: string,
    createdAt?: Date
  ) {
    this.id = id;
    this.productId = productId;
    this.userName = userName;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
  }

  static fromJson(json: ReviewJson): ReviewModel {
    return new ReviewModel(
      String(json.id || ''),
      String(json.product_id || json.productId || ''),
      json.user_name || json.userName || 'Anonymous',
      Number(json.rating || 5),
      json.comment || '',
      json.created_at || json.createdAt ? new Date(json.created_at || json.createdAt!) : new Date()
    );
  }

  toJson(): ReviewJson {
    return {
      id: this.id,
      product_id: this.productId,
      user_name: this.userName,
      rating: this.rating,
      comment: this.comment,
      created_at: this.createdAt ? this.createdAt.toISOString() : undefined,
    };
  }
}
