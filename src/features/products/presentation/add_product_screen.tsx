import React, { useState } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
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
  const { state, addProduct, resetError } = useProducts();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0]);
  const [localError, setLocalError] = useState<string | null>(null);

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
    });

    if (success) {
      Alert.alert('Success', `"${title.trim()}" has been added!`, [
        { text: 'OK', onPress: onGoBack },
      ]);
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
          <Text style={styles.headerTitle}>Add New Product</Text>
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
            {/* Title */}
            <Text style={styles.label}>Product Title</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="title"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
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
                placeholder="Wireless Noise Canceling Headphones"
              />
            </View>

            {/* Price */}
            <Text style={styles.label}>Price ($USD)</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="attach-money"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
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
                placeholder="149.99"
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
                placeholder="High-fidelity sound, 30h battery life..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Image URL */}
            <Text style={styles.label}>Image URL</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="image"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />
            </View>

            {/* Sample Image Preview & Preset Chips */}
            <Text style={styles.chipHeader}>Preset Demo Images:</Text>
            <View style={styles.sampleGrid}>
              {SAMPLE_IMAGES.map((img, idx) => {
                const isSelected = imageUrl === img;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setImageUrl(img)}
                    style={[
                      styles.sampleThumbWrap,
                      isSelected && styles.sampleThumbWrapSelected,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.sampleThumb} />
                  </TouchableOpacity>
                );
              })}
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
                  <MaterialIcons
                    name="add-circle-outline"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Publish Product</Text>
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
    maxWidth: 500,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  textAreaContainer: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textArea: {
    height: '100%',
  },
  chipHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 14,
    marginBottom: 8,
  },
  sampleGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  sampleThumbWrap: {
    width: 60,
    height: 60,
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
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
