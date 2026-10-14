import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  ApiConstants,
  BackendType,
  BACKEND_DETAILS,
} from '../../../core/constants/api_constants';
import { Colors } from '../../../core/theme/colors';
import { Injector } from '../../../data/injector';
import { StorageHelper } from '../../../utils/helper/storage_helper';
import { useAuth } from '../../auth/cubit/auth_cubit';
import { useProducts } from '../../products/cubit/product_cubit';

interface BackendSelectionScreenProps {
  isInitialSetup?: boolean;
  onFinished?: () => void;
  onGoBack?: () => void;
}

export const BackendSelectionScreen: React.FC<BackendSelectionScreenProps> = ({
  isInitialSetup = false,
  onFinished,
  onGoBack,
}) => {
  const { checkAuthStatus } = useAuth();
  const { fetchProducts, fetchCategories } = useProducts();

  const storage = StorageHelper.getInstance();
  const currentBackend = storage.getSelectedBackend() || ApiConstants.activeBackend;

  const [selectedType, setSelectedType] = useState<BackendType>(currentBackend);
  const [useCustomUrl, setUseCustomUrl] = useState<boolean>(() => {
    const saved = storage.getCustomBackendUrl(currentBackend);
    return Boolean(saved && saved.length > 0);
  });
  const [customUrl, setCustomUrl] = useState<string>(() => {
    return (
      storage.getCustomBackendUrl(currentBackend) ||
      BACKEND_DETAILS[currentBackend].defaultUrl
    );
  });

  const [isSaving, setIsSaving] = useState(false);

  // Ping states
  const [pingingBackend, setPingingBackend] = useState<BackendType | null>(null);
  const [supabasePingResult, setSupabasePingResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [mongoPingResult, setMongoPingResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSelectType = (type: BackendType) => {
    setSelectedType(type);
    if (!useCustomUrl) {
      setCustomUrl(BACKEND_DETAILS[type].defaultUrl);
    }
  };

  const handlePing = async (type: BackendType) => {
    setPingingBackend(type);
    const targetUrl =
      useCustomUrl && selectedType === type && customUrl.trim().length > 0
        ? customUrl.trim()
        : BACKEND_DETAILS[type].defaultUrl;

    const res = await Injector.testConnection(targetUrl);
    const message = res.success
      ? `Online (${res.data?.database || 'Ready'})`
      : res.message || 'Unreachable';

    if (type === BackendType.SUPABASE) {
      setSupabasePingResult({ success: res.success, message });
    } else {
      setMongoPingResult({ success: res.success, message });
    }
    setPingingBackend(null);
  };

  const handleApply = async () => {
    setIsSaving(true);
    try {
      const finalUrl = useCustomUrl && customUrl.trim().length > 0 ? customUrl.trim() : null;

      await storage.saveSelectedBackend(selectedType);
      await storage.saveCustomBackendUrl(selectedType, finalUrl);

      ApiConstants.setBackend(selectedType, finalUrl);
      Injector.updateBaseUrl();

      // Refresh authentication & product streams for new backend
      await checkAuthStatus();
      fetchProducts();
      fetchCategories();

      if (onFinished) {
        onFinished();
      } else if (onGoBack) {
        onGoBack();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to switch backend');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Header */}
      <View style={styles.header}>
        {!isInitialSetup && onGoBack && (
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {isInitialSetup ? 'Backend Configuration' : 'Switch Backend Server'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <MaterialIcons name="dns" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Choose Database Engine</Text>
            <Text style={styles.bannerSubtitle}>
              Select whether this app connects to PostgreSQL via Supabase or NoSQL via MongoDB Atlas.
            </Text>
          </View>
        </View>

        {/* Option 1: Supabase */}
        <BackendOptionCard
          type={BackendType.SUPABASE}
          title="Supabase (PostgreSQL)"
          subtitle="Relational Cloud SQL Backend"
          tag="PostgreSQL"
          tagColor={Colors.primary}
          icon="flash"
          iconColor={Colors.primary}
          isSelected={selectedType === BackendType.SUPABASE}
          url={BACKEND_DETAILS[BackendType.SUPABASE].defaultUrl}
          isPinging={pingingBackend === BackendType.SUPABASE}
          pingResult={supabasePingResult}
          onSelect={() => handleSelectType(BackendType.SUPABASE)}
          onPing={() => handlePing(BackendType.SUPABASE)}
        />

        {/* Option 2: MongoDB */}
        <BackendOptionCard
          type={BackendType.MONGODB}
          title="MongoDB (NoSQL)"
          subtitle="MongoDB Atlas + Mongoose Node.js Backend"
          tag="NoSQL Atlas"
          tagColor={Colors.mongoGreen}
          icon="leaf"
          iconColor={Colors.mongoGreen}
          isSelected={selectedType === BackendType.MONGODB}
          url={BACKEND_DETAILS[BackendType.MONGODB].defaultUrl}
          isPinging={pingingBackend === BackendType.MONGODB}
          pingResult={mongoPingResult}
          onSelect={() => handleSelectType(BackendType.MONGODB)}
          onPing={() => handlePing(BackendType.MONGODB)}
        />

        {/* Advanced Override Section */}
        <View style={styles.advancedSection}>
          <View style={styles.advancedRow}>
            <View>
              <Text style={styles.advancedTitle}>Custom Server URL Override</Text>
              <Text style={styles.advancedSubtitle}>
                Useful for local Node.js server or emulator testing
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setUseCustomUrl(!useCustomUrl)}
              style={[styles.toggleButton, useCustomUrl && styles.toggleButtonActive]}
            >
              <View style={[styles.toggleCircle, useCustomUrl && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          {useCustomUrl && (
            <View style={styles.customUrlInputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="link" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  placeholder="http://10.0.2.2:3000 or http://localhost:3000"
                  autoCapitalize="none"
                />
              </View>

              {/* Preset Chips */}
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setCustomUrl(BACKEND_DETAILS[selectedType].defaultUrl)}
                >
                  <Text style={styles.chipText}>Render Cloud</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setCustomUrl('http://10.0.2.2:3000')}
                >
                  <Text style={styles.chipText}>Android (10.0.2.2:3000)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setCustomUrl('http://localhost:3000')}
                >
                  <Text style={styles.chipText}>Localhost (3000)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={handleApply}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="check-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>
                {isInitialSetup
                  ? `Continue with ${BACKEND_DETAILS[selectedType].shortName}`
                  : `Apply & Switch to ${BACKEND_DETAILS[selectedType].shortName}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

interface BackendOptionCardProps {
  type: BackendType;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isSelected: boolean;
  url: string;
  isPinging: boolean;
  pingResult: { success: boolean; message: string } | null;
  onSelect: () => void;
  onPing: () => void;
}

const BackendOptionCard: React.FC<BackendOptionCardProps> = ({
  title,
  subtitle,
  tag,
  tagColor,
  icon,
  iconColor,
  isSelected,
  url,
  isPinging,
  pingResult,
  onSelect,
  onPing,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={[
        styles.card,
        isSelected && {
          borderColor: tagColor,
          borderWidth: 2,
          backgroundColor: '#FAFAFE',
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: `${tagColor}20` }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.cardHeaderTexts}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={[styles.tag, { backgroundColor: `${tagColor}20` }]}>
              <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>

        {/* Radio Circle */}
        <View style={[styles.radioCircle, isSelected && { borderColor: tagColor }]}>
          {isSelected && <View style={[styles.radioDot, { backgroundColor: tagColor }]} />}
        </View>
      </View>

      {/* URL & Ping button row */}
      <View style={styles.urlRow}>
        <MaterialIcons name="cloud-queue" size={16} color={Colors.textSecondary} />
        <Text style={styles.urlText} numberOfLines={1}>
          {url}
        </Text>
        <TouchableOpacity
          onPress={onPing}
          disabled={isPinging}
          style={styles.pingButton}
        >
          {isPinging ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={styles.pingContent}>
              <MaterialIcons name="wifi-tethering" size={14} color={Colors.primary} />
              <Text style={styles.pingText}>Test Ping</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Ping result status */}
      {pingResult && (
        <View style={styles.pingResultRow}>
          <MaterialIcons
            name={pingResult.success ? 'check-circle' : 'error-outline'}
            size={15}
            color={pingResult.success ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.pingResultText,
              { color: pingResult.success ? Colors.success : Colors.error },
            ]}
          >
            {pingResult.message}
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    marginRight: 14,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4DBFD',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderTexts: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  pingButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  pingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },
  pingResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  pingResultText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  advancedSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  advancedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  advancedSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  customUrlInputWrapper: {
    marginTop: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
