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
  ScrollView,
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
import { RelationshipGuideModal } from './widgets/relationship_guide_modal';

interface HomeProductsScreenProps {
  onOpenBackendSwitch: () => void;
  onOpenAddProduct: () => void;
  onOpenProductDetail: (productId: string) => void;
}

export const HomeProductsScreen: React.FC<HomeProductsScreenProps> = ({
  onOpenBackendSwitch,
  onOpenAddProduct,
  onOpenProductDetail,
}) => {
  const { logout } = useAuth();
  const {
    state,
    currentProducts,
    fetchProducts,
    categories,
    fetchCategories,
    selectedCategory,
    selectCategory,
  } = useProducts();

  const [refreshing, setRefreshing] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
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
        <View style={styles.brandTitleWrap}>
          <Text style={styles.headerTitle}>Explore Store</Text>
        </View>

        <View style={styles.actionsRow}>
          {/* Relational DB Guide Modal Button */}
          <TouchableOpacity
            style={styles.guidePill}
            onPress={() => setShowGuideModal(true)}
          >
            <Ionicons name="git-network" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.guidePillText}>DB Relations</Text>
          </TouchableOpacity>

          {/* Backend Selector Pill */}
          <TouchableOpacity
            style={[styles.backendPill, { borderColor: badgeColor }]}
            onPress={onOpenBackendSwitch}
          >
            <Ionicons
              name={isMongo ? 'leaf' : 'flash'}
              size={12}
              color={badgeColor}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.backendPillText, { color: badgeColor }]}>
              {BACKEND_DETAILS[currentBackend].shortName}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color={badgeColor} />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={confirmLogout}>
            <MaterialIcons name="logout" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Relational Learning Strip (tappable) */}
      <TouchableOpacity
        style={styles.relationalStrip}
        activeOpacity={0.85}
        onPress={() => setShowGuideModal(true)}
      >
        <Ionicons name="school" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.relationalStripText}>
          Learning Mode: <Text style={styles.relationalBold}>1:1 Specs</Text> •{' '}
          <Text style={styles.relationalBold}>1:M Reviews</Text> •{' '}
          <Text style={styles.relationalBold}>M:M Categories</Text>
        </Text>
        <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
      </TouchableOpacity>

      {/* M:M Categories Filter Horizontal Bar */}
      {categories && categories.length > 0 && (
        <View style={styles.categoryFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterScroll}
          >
            {/* "All" Filter chip */}
            <TouchableOpacity
              style={[
                styles.categoryFilterChip,
                !selectedCategory && styles.categoryFilterChipActive,
              ]}
              onPress={() => selectCategory(null)}
            >
              <Text
                style={[
                  styles.categoryFilterChipText,
                  !selectedCategory && styles.categoryFilterChipTextActive,
                ]}
              >
                All Products
              </Text>
            </TouchableOpacity>

            {/* Individual categories */}
            {categories.map((cat) => {
              const isActive = selectedCategory?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryFilterChip,
                    isActive && {
                      backgroundColor: cat.color || Colors.primary,
                      borderColor: cat.color || Colors.primary,
                    },
                  ]}
                  onPress={() => selectCategory(isActive ? null : cat)}
                >
                  <Text
                    style={[
                      styles.categoryFilterChipText,
                      isActive && styles.categoryFilterChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateText}>
              Loading products from {BACKEND_DETAILS[currentBackend].shortName}...
            </Text>
          </View>
        ) : state.type === 'error' && currentProducts.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="cloud-off" size={48} color={Colors.error} />
            <Text style={styles.errorTitle}>Could not load products</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts()}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : currentProducts.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="inventory-2" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {selectedCategory ? `No products in "${selectedCategory.name}"` : 'No products found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory
                ? 'Try selecting "All Products" or add a new product in this category!'
                : 'Be the first to add a relational product to this database!'}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onOpenAddProduct}>
              <Text style={styles.retryBtnText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={currentProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => onOpenProductDetail(item.id)}
              />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
              />
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

      {/* Interactive Relational Guide Modal */}
      <RelationshipGuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: '#D4DBFD',
  },
  guidePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  backendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  backendPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 6,
  },
  relationalStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  relationalStripText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  relationalBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryFilterContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  categoryFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryFilterChipTextActive: {
    color: '#FFFFFF',
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
