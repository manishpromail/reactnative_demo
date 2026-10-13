import { ProductModel } from '../data/product_model';

/**
 * ProductState discriminated union matching Flutter's abstract class ProductState.
 * In Flutter:
 *   - ProductInitial
 *   - ProductLoading
 *   - ProductLoaded(products)
 *   - ProductActionInProgress
 *   - ProductAddedSuccess(product)
 *   - ProductError(message)
 */
export type ProductState =
  | { type: 'initial' }
  | { type: 'loading' }
  | { type: 'loaded'; products: ProductModel[] }
  | { type: 'actionInProgress' }
  | { type: 'addedSuccess'; product: ProductModel }
  | { type: 'error'; message: string };
