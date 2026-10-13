import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  ApiConstants,
  BackendType,
  BACKEND_DETAILS,
} from '../../../core/constants/api_constants';
import { Colors } from '../../../core/theme/colors';
import { useAuth } from '../../auth/cubit/auth_cubit';
import { useProducts } from '../cubit/product_cubit';
import { ProductCard } from './widgets/product_card';

interface HomeProductsScreenProps {
  onOpenBackendSwitch: () => void;
  onOpenAddProduct: () => void;
}

export const HomeProductsScreen: React.FC<HomeProductsScreenProps> = ({
  onOpenBackendSwitch,
  onOpenAddProduct,
}) => {
  const { logout } = useAuth();
  const { state, currentProducts, fetchProducts } = useProducts();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const currentBackend = ApiConstants.activeBackend;
  const isMongo = currentBackend === BackendType.MONGODB;
  const badgeColor = isMongo ? Colors.mongoGreen : Colors.primary;

  const isLoading = state.type === 'loading' && currentProducts.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Store</Text>

        <View style={styles.actionsRow}>
          {/* Backend Selector Pill */}
          <TouchableOpacity
            style={[styles.backendPill, { borderColor: badgeColor }]}
            onPress={onOpenBackendSwitch}
          >
            <Ionicons
              name={isMongo ? 'leaf' : 'flash'}
              size={13}
              color={badgeColor}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.backendPillText, { color: badgeColor }]}>
              {BACKEND_DETAILS[currentBackend].shortName}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={16}
              color={badgeColor}
            />
          </TouchableOpacity>

          {/* Refresh Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={fetchProducts}>
            <MaterialIcons name="refresh" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={confirmLogout}>
            <MaterialIcons name="logout" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateText}>Loading products from {BACKEND_DETAILS[currentBackend].shortName}...</Text>
          </View>
        ) : state.type === 'error' && currentProducts.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="cloud-off" size={48} color={Colors.error} />
            <Text style={styles.errorTitle}>Could not load products</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : currentProducts.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="inventory-2" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to add a product to this {BACKEND_DETAILS[currentBackend].shortName} database!
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onOpenAddProduct}>
              <Text style={styles.retryBtnText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={currentProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} />}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
          />
        )}
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={onOpenAddProduct}
      >
        <MaterialIcons name="add" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.fabText}>Add Product</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  backendPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  stateText: {
    marginTop: 14,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 14,
  },
  errorMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 280,
  },
  retryBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
