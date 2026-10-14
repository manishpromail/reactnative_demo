import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { ProductModel } from '../data/product_model';
import { useProducts } from '../cubit/product_cubit';

interface ProductDetailsScreenProps {
  productId: string;
  onGoBack: () => void;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  productId,
  onGoBack,
}) => {
  const { fetchProductById, addReview } = useProducts();
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductById(productId);
      if (data) {
        setProduct(data);
      } else {
        setError('Could not load product details.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [productId]);

  const handlePostReview = async () => {
    if (!reviewerName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Required', 'Please enter your review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview(productId, {
        userName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setShowReviewModal(false);
      setReviewerName('');
      setReviewComment('');
      setReviewRating(5);

      // Refresh product to show new review
      await loadDetails();
      Alert.alert('Thank you!', 'Your 1:M review has been published.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading relational product data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Could not load product</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadDetails}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const specs = product.productDetails;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>1:1 • 1:M • M:M</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageWrap}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imageFallback}>
              <MaterialIcons name="shopping-bag" size={60} color={Colors.textMuted} />
            </View>
          )}

          {/* Price Tag Floating */}
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.mainInfoCard}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productDescription}>
            {product.description || 'No description provided.'}
          </Text>
        </View>

        {/* ========================================================================= */}
        {/* RELATIONSHIP 1: MANY-TO-MANY (M:M) - Categories via Junction Table        */}
        {/* ========================================================================= */}
        <View style={styles.relationCard}>
          <View style={styles.relationHeader}>
            <View style={[styles.relationBadge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.relationBadgeText, { color: '#047857' }]}>M:M Relationship</Text>
            </View>
            <Text style={styles.relationTitle}>Categories</Text>
          </View>
          <Text style={styles.relationExplainer}>
            Linked via junction table <Text style={styles.codeSnippet}>product_categories</Text> with composite primary key (product_id, category_id).
          </Text>

          {product.categories && product.categories.length > 0 ? (
            <View style={styles.chipsWrap}>
              {product.categories.map((cat) => (
                <View
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: `${cat.color || Colors.primary}15`, borderColor: `${cat.color || Colors.primary}40` },
                  ]}
                >
                  <Ionicons name="pricetag" size={12} color={cat.color || Colors.primary} style={{ marginRight: 5 }} />
                  <Text style={[styles.categoryChipText, { color: cat.color || Colors.primary }]}>
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRelationState}>
              <Text style={styles.emptyRelationText}>
                No categories associated yet. Add some via the Add Product screen.
              </Text>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* RELATIONSHIP 2: ONE-TO-ONE (1:1) - Product Technical Specifications       */}
        {/* ========================================================================= */}
        <View style={styles.relationCard}>
          <View style={styles.relationHeader}>
            <View style={[styles.relationBadge, { backgroundColor: Colors.primaryContainer }]}>
              <Text style={[styles.relationBadgeText, { color: Colors.primary }]}>1:1 Relationship</Text>
            </View>
            <Text style={styles.relationTitle}>Technical Specifications</Text>
          </View>
          <Text style={styles.relationExplainer}>
            Enforced by <Text style={styles.codeSnippet}>product_id UNIQUE FK</Text> in{' '}
            <Text style={styles.codeSnippet}>product_details</Text>. Exactly one spec record per product.
          </Text>

          {specs ? (
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>SKU / Barcode</Text>
                <Text style={styles.specValue}>{specs.sku}</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Warranty</Text>
                <Text style={styles.specValue}>{specs.warrantyMonths} Months</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Manufacturer</Text>
                <Text style={styles.specValue}>{specs.manufacturer}</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Weight</Text>
                <Text style={styles.specValue}>{specs.weightKg} kg</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Dimensions</Text>
                <Text style={styles.specValue}>{specs.dimensions}</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Origin</Text>
                <Text style={styles.specValue}>{specs.originCountry}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyRelationState}>
              <MaterialIcons name="info-outline" size={20} color={Colors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={styles.emptyRelationText}>
                No 1:1 specification record created for this product yet.
              </Text>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* RELATIONSHIP 3: ONE-TO-MANY (1:M) - Customer Reviews                      */}
        {/* ========================================================================= */}
        <View style={styles.relationCard}>
          <View style={styles.relationHeader}>
            <View style={[styles.relationBadge, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.relationBadgeText, { color: '#6D28D9' }]}>1:M Relationship</Text>
            </View>
            <Text style={styles.relationTitle}>Customer Reviews ({product.reviewCount})</Text>
          </View>
          <Text style={styles.relationExplainer}>
            Multiple reviews reference <Text style={styles.codeSnippet}>product_id FK</Text> in{' '}
            <Text style={styles.codeSnippet}>reviews</Text> table.
          </Text>

          {/* Average Rating Bar & Add Review CTA */}
          <View style={styles.reviewHeaderRow}>
            <View style={styles.ratingScoreWrap}>
              <Ionicons name="star" size={22} color="#F59E0B" />
              <Text style={styles.ratingScoreText}>
                {product.averageRating > 0 ? product.averageRating.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.ratingScoreMax}>/ 5.0</Text>
            </View>

            <TouchableOpacity
              style={styles.addReviewBtn}
              onPress={() => setShowReviewModal(true)}
            >
              <MaterialIcons name="rate-review" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addReviewBtnText}>Add Review</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          {product.reviews && product.reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {product.reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewTopRow}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.avatarLetter}>
                        {rev.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{rev.userName}</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= rev.rating ? 'star' : 'star-outline'}
                            size={13}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRelationState}>
              <Ionicons name="chatbubbles-outline" size={28} color={Colors.textMuted} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyRelationText}>No reviews yet.</Text>
              <Text style={styles.emptyRelationSub}>
                Be the first to leave a 1:M review for this product!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* ADD REVIEW MODAL DIALOG (1:M Creation)                                    */}
      {/* ========================================================================= */}
      <Modal visible={showReviewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review (1:M)</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Adds a row to <Text style={styles.codeSnippet}>reviews</Text> referencing this product ID.
            </Text>

            {/* Rating Stars Picker */}
            <Text style={styles.fieldLabel}>Rating:</Text>
            <View style={styles.ratingPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={styles.starTouch}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Name Input */}
            <Text style={styles.fieldLabel}>Your Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={reviewerName}
              onChangeText={setReviewerName}
              placeholder="e.g. Alex Johnson"
            />

            {/* Comment Input */}
            <Text style={styles.fieldLabel}>Your Review:</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="What do you think of this product?"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Submit CTA */}
            <TouchableOpacity
              style={[styles.modalSubmitBtn, submittingReview && styles.btnDisabled]}
              onPress={handlePostReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4DBFD',
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  imageWrap: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    backgroundColor: Colors.inputFill,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  pricePill: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  mainInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  relationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  relationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  relationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  relationBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  relationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  relationExplainer: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  codeSnippet: {
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    color: Colors.textPrimary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 12,
  },
  specItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 3,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyRelationState: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  emptyRelationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyRelationSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ratingScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScoreText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  ratingScoreMax: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addReviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  ratingPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starTouch: {
    padding: 4,
  },
  modalInput: {
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalTextArea: {
    height: 80,
    paddingTop: 10,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
