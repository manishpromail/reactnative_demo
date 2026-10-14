import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { useProducts } from '../cubit/product_cubit';

interface AddProductScreenProps {
  onGoBack: () => void;
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
];

export const AddProductScreen: React.FC<AddProductScreenProps> = ({ onGoBack }) => {
  const { state, addProduct, resetError, categories, fetchCategories } = useProducts();

  // Basic Info
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0]);

  // M:M Selected Categories
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);

  // 1:1 Technical Specifications
  const [showSpecsSection, setShowSpecsSection] = useState(true);
  const [sku, setSku] = useState(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
  const [manufacturer, setManufacturer] = useState('Apex Innovations Ltd.');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [weightKg, setWeightKg] = useState('0.45');
  const [dimensions, setDimensions] = useState('18 x 14 x 6 cm');
  const [originCountry, setOriginCountry] = useState('United States');

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleCategory = (catId: number) => {
    setSelectedCatIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const isSaving = state.type === 'actionInProgress';
  const errorMessage = state.type === 'error' ? state.message : localError;

  const handleSubmit = async () => {
    setLocalError(null);
    resetError();

    if (!title.trim()) {
      setLocalError('Please enter a product title.');
      return;
    }

    const parsedPrice = parseFloat(price.trim());
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setLocalError('Please enter a valid positive price.');
      return;
    }

    const success = await addProduct({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      imageUrl: imageUrl.trim(),
      categoryIds: selectedCatIds,
      productDetails: {
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
        warrantyMonths: parseInt(warrantyMonths, 10) || 12,
        manufacturer: manufacturer.trim() || 'General Manufacturer',
        weightKg: parseFloat(weightKg) || 0.5,
        dimensions: dimensions.trim() || 'Standard',
        originCountry: originCountry.trim() || 'United States',
      },
    });

    if (success) {
      Alert.alert(
        'Product & Relations Created!',
        `"${title.trim()}" created with 1:1 specs and ${selectedCatIds.length} categories (M:M)!`,
        [{ text: 'Awesome', onPress: onGoBack }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Relational Product</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* 1. Basic Information Section */}
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="inventory" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderTitle}>1. Basic Information (products table)</Text>
            </View>

            {/* Title */}
            <Text style={styles.label}>Product Title</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="title" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errorMessage) {
                    setLocalError(null);
                    resetError();
                  }
                }}
                placeholder="Sony WH-1000XM5 Headphones"
              />
            </View>

            {/* Price */}
            <Text style={styles.label}>Price ($USD)</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="attach-money" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={(t) => {
                  setPrice(t);
                  if (errorMessage) {
                    setLocalError(null);
                    resetError();
                  }
                }}
                placeholder="299.99"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Premium acoustic active noise cancelation..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Image URL & Preset chips */}
            <Text style={styles.label}>Image URL</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="image" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.chipHeader}>Preset Demo Images:</Text>
            <View style={styles.sampleGrid}>
              {SAMPLE_IMAGES.map((img, idx) => {
                const isSelected = imageUrl === img;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setImageUrl(img)}
                    style={[styles.sampleThumbWrap, isSelected && styles.sampleThumbWrapSelected]}
                  >
                    <Image source={{ uri: img }} style={styles.sampleThumb} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Many-to-Many Categories Section */}
            <View style={styles.relationSectionBox}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.miniBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#047857' }]}>M:M</Text>
                </View>
                <Text style={styles.sectionHeaderTitle}>Select Categories (product_categories)</Text>
              </View>
              <Text style={styles.sectionExplainer}>
                Tap to link multiple categories to this product via the junction table.
              </Text>

              <View style={styles.categoryPickerRow}>
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const catId = Number(cat.id);
                    const isSelected = selectedCatIds.includes(catId);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => toggleCategory(catId)}
                        style={[
                          styles.categorySelectChip,
                          isSelected && {
                            backgroundColor: cat.color || Colors.primary,
                            borderColor: cat.color || Colors.primary,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={14}
                          color={isSelected ? '#FFFFFF' : Colors.textSecondary}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.categorySelectChipText,
                            isSelected && { color: '#FFFFFF' },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.emptyCatNotice}>
                    Categories loading or run schema_relationships.sql in Supabase to seed categories.
                  </Text>
                )}
              </View>
            </View>

            {/* 3. One-to-One Technical Specifications Section */}
            <View style={styles.relationSectionBox}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setShowSpecsSection(!showSpecsSection)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.miniBadge, { backgroundColor: Colors.primaryContainer }]}>
                    <Text style={[styles.miniBadgeText, { color: Colors.primary }]}>1:1</Text>
                  </View>
                  <Text style={styles.sectionHeaderTitle}>Technical Specs (product_details)</Text>
                </View>
                <MaterialIcons
                  name={showSpecsSection ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
              <Text style={styles.sectionExplainer}>
                Enforced by UNIQUE foreign key in product_details table.
              </Text>

              {showSpecsSection && (
                <View style={{ marginTop: 10 }}>
                  {/* SKU */}
                  <Text style={styles.label}>SKU / Barcode (Unique)</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="qr-code" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="SKU-102938" />
                  </View>

                  {/* Manufacturer */}
                  <Text style={styles.label}>Manufacturer</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="business" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} placeholder="Sony Corp." />
                  </View>

                  {/* Warranty & Weight Row */}
                  <View style={styles.twoColumnRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.label}>Warranty (Months)</Text>
                      <View style={styles.inputContainer}>
                        <TextInput style={styles.input} value={warrantyMonths} onChangeText={setWarrantyMonths} keyboardType="numeric" />
                      </View>
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.label}>Weight (kg)</Text>
                      <View style={styles.inputContainer}>
                        <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
                      </View>
                    </View>
                  </View>

                  {/* Dimensions */}
                  <Text style={styles.label}>Dimensions</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="straighten" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput style={styles.input} value={dimensions} onChangeText={setDimensions} placeholder="20 x 18 x 7 cm" />
                  </View>

                  {/* Country of Origin */}
                  <Text style={styles.label}>Origin Country</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="public" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput style={styles.input} value={originCountry} onChangeText={setOriginCountry} placeholder="Japan" />
                  </View>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isSaving && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Publish Product with Relationships</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxWidth: 550,
    alignSelf: 'center',
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  form: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionExplainer: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  textAreaContainer: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: '100%',
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  sampleGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  sampleThumbWrap: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  sampleThumbWrapSelected: {
    borderColor: Colors.primary,
  },
  sampleThumb: {
    width: '100%',
    height: '100%',
  },
  relationSectionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 16,
    marginBottom: 6,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categorySelectChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyCatNotice: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
