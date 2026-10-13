import { UserModel } from '../data/user_model';

/**
 * AuthState discriminated union matching Flutter's abstract class AuthState.
 * In Flutter:
 *   - AuthInitial
 *   - AuthLoading
 *   - AuthAuthenticated
 *   - AuthUnauthenticated
 *   - AuthSignupSuccess
 *   - AuthError
 */
export type AuthState =
  | { type: 'initial' }
  | { type: 'loading' }
  | { type: 'authenticated'; user: UserModel }
  | { type: 'unauthenticated' }
  | { type: 'signupSuccess'; message: string }
  | { type: 'error'; message: string };
