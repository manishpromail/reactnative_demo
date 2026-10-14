import { CategoryJson, CategoryModel } from './category_model';
import { ProductDetailJson, ProductDetailModel } from './product_detail_model';
import { ReviewJson, ReviewModel } from './review_model';

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

  // Relational fields
  product_details?: ProductDetailJson | ProductDetailJson[] | null;
  productDetails?: ProductDetailJson | null;
  reviews?: ReviewJson[];
  review_count?: number;
  reviewCount?: number;
  average_rating?: number;
  averageRating?: number;
  categories?: CategoryJson[];
}

export class ProductModel {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly imageUrl: string;
  readonly createdAt?: Date;

  // 1:1 Relationship
  readonly productDetails?: ProductDetailModel;

  // 1:M Relationship
  readonly reviews: ReviewModel[];
  readonly reviewCount: number;
  readonly averageRating: number;

  // M:M Relationship
  readonly categories: CategoryModel[];

  constructor(
    id: string,
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    createdAt?: Date,
    productDetails?: ProductDetailModel,
    reviews: ReviewModel[] = [],
    reviewCount: number = 0,
    averageRating: number = 0,
    categories: CategoryModel[] = []
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
    this.productDetails = productDetails;
    this.reviews = reviews;
    this.reviewCount = reviewCount;
    this.averageRating = averageRating;
    this.categories = categories;
  }

  static fromJson(json: ProductJson): ProductModel {
    const rawPrice = json.price != null ? Number(json.price) : 0;
    const rawDate = json.created_at || json.createdAt;

    // 1:1 Product Details
    let details: ProductDetailModel | undefined;
    const rawDetails = json.product_details ?? json.productDetails;
    if (Array.isArray(rawDetails)) {
      if (rawDetails.length > 0) {
        details = ProductDetailModel.fromJson(rawDetails[0]);
      }
    } else if (rawDetails && typeof rawDetails === 'object') {
      details = ProductDetailModel.fromJson(rawDetails);
    }

    // 1:M Reviews
    const reviews = Array.isArray(json.reviews)
      ? json.reviews.map((r) => ReviewModel.fromJson(r))
      : [];

    const reviewCount = json.review_count ?? json.reviewCount ?? reviews.length;
    let avgRating = Number(json.average_rating ?? json.averageRating ?? 0);
    if (!avgRating && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    // M:M Categories
    const categories = Array.isArray(json.categories)
      ? json.categories.map((c) => CategoryModel.fromJson(c))
      : [];

    return new ProductModel(
      String(json.id || json._id || ''),
      json.title || '',
      json.description || '',
      isNaN(rawPrice) ? 0 : rawPrice,
      json.image_url || json.imageUrl || '',
      rawDate ? new Date(rawDate) : undefined,
      details,
      reviews,
      reviewCount,
      avgRating,
      categories
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
      product_details: this.productDetails ? this.productDetails.toJson() : null,
      reviews: this.reviews.map((r) => r.toJson()),
      review_count: this.reviewCount,
      average_rating: this.averageRating,
      categories: this.categories.map((c) => c.toJson()),
    };
  }
}
