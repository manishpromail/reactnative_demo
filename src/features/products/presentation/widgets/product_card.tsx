import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ProductModel } from '../../data/product_model';
import { Colors } from '../../../../core/theme/colors';

interface ProductCardProps {
  product: ProductModel;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* Image Container with Fallback & Floating Price Pill */}
      <View style={styles.imageContainer}>
        {product.imageUrl && !imageError ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <MaterialIcons name="shopping-bag" size={44} color={Colors.textMuted} />
          </View>
        )}

        {/* Price Pill Overlay (Top-Right) */}
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
        </View>

        {/* 1:1 Specs Badge Overlay (Top-Left if available) */}
        {product.productDetails && (
          <View style={styles.specsPill}>
            <MaterialIcons name="verified" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.specsPillText}>1:1 Specs</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* M:M Categories Badges */}
        {product.categories && product.categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {product.categories.slice(0, 3).map((cat) => (
              <View
                key={cat.id}
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${cat.color || Colors.primary}18` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    { color: cat.color || Colors.primary },
                  ]}
                >
                  {cat.name}
                </Text>
              </View>
            ))}
            {product.categories.length > 3 && (
              <View style={[styles.categoryBadge, styles.categoryMoreBadge]}>
                <Text style={styles.categoryMoreText}>+{product.categories.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {product.description || 'No description provided.'}
        </Text>

        {/* Footer: 1:M Reviews & View Details prompt */}
        <View style={styles.footerRow}>
          {/* 1:M Rating indicator */}
          <View style={styles.ratingWrap}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'}
            </Text>
            <Text style={styles.reviewCountText}>
              ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
            </Text>
          </View>

          <View style={styles.detailLinkWrap}>
            <Text style={styles.detailLinkText}>View Specs</Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.inputFill,
    position: 'relative',
    overflow: 'hidden',
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
    top: 10,
    right: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  specsPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specsPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailsContainer: {
    padding: 14,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryMoreBadge: {
    backgroundColor: '#E2E8F0',
  },
  categoryMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  detailLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
