import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthRepository } from '../data/auth_repository';
import { AuthState } from './auth_state';

interface AuthContextValue {
  state: AuthState;
  checkAuthStatus: () => Promise<void>;
  signup: (params: { email: string; password: string; name?: string }) => Promise<boolean>;
  login: (params: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  resetError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authRepository = new AuthRepository();

/**
 * AuthProvider / AuthCubit equivalent in React Native.
 * Replicates Flutter's BlocProvider<AuthCubit> & Cubit<AuthState>.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ type: 'initial' });

  const checkAuthStatus = useCallback(async () => {
    try {
      const user = await authRepository.getSavedUser();
      if (user) {
        setState({ type: 'authenticated', user });
      } else {
        setState({ type: 'unauthenticated' });
      }
    } catch {
      setState({ type: 'unauthenticated' });
    }
  }, []);

  const signup = useCallback(
    async (params: { email: string; password: string; name?: string }): Promise<boolean> => {
      setState({ type: 'loading' });
      try {
        await authRepository.signup(params);
        setState({
          type: 'signupSuccess',
          message:
            'Account created successfully! If email verification is enabled on Supabase, check your inbox before logging in.',
        });
        return true;
      } catch (e: any) {
        setState({
          type: 'error',
          message: e.message?.replace('Exception: ', '') || 'Signup failed',
        });
        return false;
      }
    },
    []
  );

  const login = useCallback(
    async (params: { email: string; password: string }): Promise<boolean> => {
      setState({ type: 'loading' });
      try {
        const user = await authRepository.login(params);
        setState({ type: 'authenticated', user });
        return true;
      } catch (e: any) {
        setState({
          type: 'error',
          message: e.message?.replace('Exception: ', '') || 'Login failed',
        });
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await authRepository.logout();
    setState({ type: 'unauthenticated' });
  }, []);

  const resetError = useCallback(() => {
    setState({ type: 'unauthenticated' });
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{
        state,
        checkAuthStatus,
        signup,
        login,
        logout,
        resetError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook equivalent to context.read<AuthCubit>() or BlocBuilder<AuthCubit, AuthState> in Flutter.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
