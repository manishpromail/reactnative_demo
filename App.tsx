import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiConstants } from './src/core/constants/api_constants';
import { Colors } from './src/core/theme/colors';
import { Injector } from './src/data/injector';
import { StorageHelper } from './src/utils/helper/storage_helper';

import { AuthProvider, useAuth } from './src/features/auth/cubit/auth_cubit';
import { ProductProvider } from './src/features/products/cubit/product_cubit';

import { BackendSelectionScreen } from './src/features/backend_selection/presentation/backend_selection_screen';
import { LoginScreen } from './src/features/auth/presentation/login_screen';
import { SignupScreen } from './src/features/auth/presentation/signup_screen';
import { HomeProductsScreen } from './src/features/products/presentation/home_products_screen';
import { AddProductScreen } from './src/features/products/presentation/add_product_screen';
import { ProductDetailsScreen } from './src/features/products/presentation/product_details_screen';

type ActiveView =
  | 'auth_gate'
  | 'signup'
  | 'add_product'
  | 'backend_selection'
  | 'product_detail';

/**
 * AppNavigator managing navigation across Auth, Products, and Relational Screens.
 */
const AppNavigator: React.FC<{
  initialSetupNeeded: boolean;
  onFinishInitialSetup: () => void;
}> = ({ initialSetupNeeded, onFinishInitialSetup }) => {
  const { state } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>(
    initialSetupNeeded ? 'backend_selection' : 'auth_gate'
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isInitialConfig, setIsInitialConfig] = useState(initialSetupNeeded);

  // If user is currently in initial backend setup
  if (isInitialConfig) {
    return (
      <BackendSelectionScreen
        isInitialSetup={true}
        onFinished={() => {
          setIsInitialConfig(false);
          setActiveView('auth_gate');
          onFinishInitialSetup();
        }}
      />
    );
  }

  // Backend Switcher Screen (opened from Home or Login screen)
  if (activeView === 'backend_selection') {
    return (
      <BackendSelectionScreen
        isInitialSetup={false}
        onGoBack={() => setActiveView('auth_gate')}
      />
    );
  }

  // Add Product Screen
  if (activeView === 'add_product') {
    return (
      <AddProductScreen
        onGoBack={() => setActiveView('auth_gate')}
      />
    );
  }

  // Product Details Screen (1:1 specs, 1:M reviews, M:M categories)
  if (activeView === 'product_detail' && selectedProductId) {
    return (
      <ProductDetailsScreen
        productId={selectedProductId}
        onGoBack={() => setActiveView('auth_gate')}
      />
    );
  }

  // Signup Screen
  if (activeView === 'signup') {
    return (
      <SignupScreen
        onNavigateToLogin={() => setActiveView('auth_gate')}
      />
    );
  }

  // Auth Gate handling
  if (state.type === 'initial') {
    return (
      <View style={styles.splashCenter}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (state.type === 'authenticated') {
    return (
      <HomeProductsScreen
        onOpenBackendSwitch={() => setActiveView('backend_selection')}
        onOpenAddProduct={() => setActiveView('add_product')}
        onOpenProductDetail={(id) => {
          setSelectedProductId(id);
          setActiveView('product_detail');
        }}
      />
    );
  }

  // Default to Login screen
  return (
    <LoginScreen
      onNavigateToSignup={() => setActiveView('signup')}
      onOpenBackendSwitch={() => setActiveView('backend_selection')}
    />
  );
};

/**
 * Root Application Component
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialSetupNeeded, setInitialSetupNeeded] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      await StorageHelper.init();

      const storage = StorageHelper.getInstance();
      const hasBackend = storage.hasSelectedBackend();

      if (hasBackend) {
        const savedBackend = storage.getSelectedBackend();
        if (savedBackend) {
          const customUrl = storage.getCustomBackendUrl(savedBackend);
          ApiConstants.setBackend(savedBackend, customUrl);
          Injector.updateBaseUrl();
        }
      } else {
        setInitialSetupNeeded(true);
      }

      setIsReady(true);
    }

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashCenter}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <ProductProvider>
          <AppNavigator
            initialSetupNeeded={initialSetupNeeded}
            onFinishInitialSetup={() => setInitialSetupNeeded(false)}
          />
        </ProductProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashCenter: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
