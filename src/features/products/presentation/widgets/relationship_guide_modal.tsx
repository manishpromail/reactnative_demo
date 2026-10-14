import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../core/theme/colors';
import { ProductRepository } from '../../data/product_repository';

interface RelationshipGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = '1:1' | '1:M' | 'M:M' | 'status';

export const RelationshipGuideModal: React.FC<RelationshipGuideModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('1:1');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [schemaData, setSchemaData] = useState<any>(null);

  const checkDatabaseStatus = async () => {
    setCheckingStatus(true);
    try {
      const repo = new ProductRepository();
      const res = await repo.getSchemaInfo();
      setSchemaData(res);
    } catch (e: any) {
      console.warn('Failed to fetch schema info:', e.message);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (visible) {
      checkDatabaseStatus();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Ionicons name="git-network" size={22} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Database Relationships</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === '1:1' && styles.tabActive]}
            onPress={() => setActiveTab('1:1')}
          >
            <Text style={[styles.tabText, activeTab === '1:1' && styles.tabTextActive]}>
              1:1 (One-to-One)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === '1:M' && styles.tabActive]}
            onPress={() => setActiveTab('1:M')}
          >
            <Text style={[styles.tabText, activeTab === '1:M' && styles.tabTextActive]}>
              1:M (One-to-Many)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'M:M' && styles.tabActive]}
            onPress={() => setActiveTab('M:M')}
          >
            <Text style={[styles.tabText, activeTab === 'M:M' && styles.tabTextActive]}>
              M:M (Many-to-Many)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'status' && styles.tabActive]}
            onPress={() => setActiveTab('status')}
          >
            <Text style={[styles.tabText, activeTab === 'status' && styles.tabTextActive]}>
              ⚡ DB Status
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {/* TAB 1: 1:1 */}
          {activeTab === '1:1' && (
            <View>
              <View style={styles.badgeBanner}>
                <Text style={styles.badgeBannerTitle}>One-to-One (1:1) Relationship</Text>
                <Text style={styles.badgeBannerSubtitle}>
                  One product corresponds to exactly ONE technical specification record.
                </Text>
              </View>

              <View style={styles.diagramCard}>
                <View style={styles.nodeBox}>
                  <Text style={styles.nodeTitle}>products</Text>
                  <Text style={styles.nodeColumn}>🔑 id (PK)</Text>
                  <Text style={styles.nodeColumn}>title, price</Text>
                </View>

                <View style={styles.arrowBox}>
                  <Text style={styles.arrowLabel}>1 : 1</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                </View>

                <View style={styles.nodeBox}>
                  <Text style={styles.nodeTitle}>product_details</Text>
                  <Text style={styles.nodeColumnHighlight}>🔗 product_id (UNIQUE FK)</Text>
                  <Text style={styles.nodeColumn}>sku, warranty, weight</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Why & How It Works in PostgreSQL:</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>The Secret:</Text> The foreign key column{' '}
                  <Text style={styles.codeText}>product_id</Text> in{' '}
                  <Text style={styles.codeText}>product_details</Text> has a{' '}
                  <Text style={styles.boldText}>UNIQUE</Text> constraint.
                </Text>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>Integrity:</Text> If anyone tries to insert a second specification sheet for the same product, PostgreSQL rejects it immediately.
                </Text>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>Real-World Value:</Text> High-volume product listings remain fast and lightweight, while heavy technical specs are loaded only when opening product details.
                </Text>
              </View>

              <Text style={styles.sectionHeader}>SQL Definition:</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>
                  {`CREATE TABLE product_details (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  warranty_months INT DEFAULT 12,
  manufacturer TEXT,
  weight_kg NUMERIC(6, 2)
);`}
                </Text>
              </View>
            </View>
          )}

          {/* TAB 2: 1:M */}
          {activeTab === '1:M' && (
            <View>
              <View style={[styles.badgeBanner, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
                <Text style={[styles.badgeBannerTitle, { color: '#6D28D9' }]}>
                  One-to-Many (1:M) Relationship
                </Text>
                <Text style={[styles.badgeBannerSubtitle, { color: '#5B21B6' }]}>
                  One product can have MULTIPLE customer reviews, but each review belongs to only ONE product.
                </Text>
              </View>

              <View style={styles.diagramCard}>
                <View style={styles.nodeBox}>
                  <Text style={styles.nodeTitle}>products (1)</Text>
                  <Text style={styles.nodeColumn}>🔑 id (PK)</Text>
                  <Text style={styles.nodeColumn}>title, price</Text>
                </View>

                <View style={styles.arrowBox}>
                  <Text style={[styles.arrowLabel, { color: '#6D28D9' }]}>1 : Many</Text>
                  <Ionicons name="arrow-forward" size={20} color="#6D28D9" />
                </View>

                <View style={styles.nodeBox}>
                  <Text style={[styles.nodeTitle, { color: '#6D28D9' }]}>reviews (M)</Text>
                  <Text style={styles.nodeColumnHighlight}>🔗 product_id (FK)</Text>
                  <Text style={styles.nodeColumn}>rating (1-5), comment</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Why & How It Works in PostgreSQL:</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>The Secret:</Text> Unlike 1:1, the foreign key{' '}
                  <Text style={styles.codeText}>product_id</Text> is <Text style={styles.boldText}>NOT unique</Text>.
                </Text>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>Cascading Deletes:</Text> With{' '}
                  <Text style={styles.codeText}>ON DELETE CASCADE</Text>, deleting a product automatically purges all of its associated reviews so no orphaned rows remain.
                </Text>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>Indexed for Speed:</Text> Creating an index on{' '}
                  <Text style={styles.codeText}>reviews(product_id)</Text> makes fetching all reviews for a product instant.
                </Text>
              </View>

              <Text style={styles.sectionHeader}>SQL Definition:</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>
                  {`CREATE TABLE reviews (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL
);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);`}
                </Text>
              </View>
            </View>
          )}

          {/* TAB 3: M:M */}
          {activeTab === 'M:M' && (
            <View>
              <View style={[styles.badgeBanner, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.badgeBannerTitle, { color: '#047857' }]}>
                  Many-to-Many (M:M) Relationship
                </Text>
                <Text style={[styles.badgeBannerSubtitle, { color: '#065F46' }]}>
                  A product belongs to MULTIPLE categories. A category contains MULTIPLE products.
                </Text>
              </View>

              <View style={styles.diagramCardCol}>
                <View style={styles.diagramRow}>
                  <View style={styles.nodeBox}>
                    <Text style={styles.nodeTitle}>products</Text>
                    <Text style={styles.nodeColumn}>🔑 id (PK)</Text>
                  </View>

                  <Ionicons name="arrow-forward" size={18} color="#047857" style={{ marginHorizontal: 8 }} />

                  <View style={[styles.nodeBox, { borderColor: '#047857', backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.nodeTitle, { color: '#047857' }]}>product_categories</Text>
                    <Text style={styles.nodeColumnHighlight}>🔗 product_id (FK)</Text>
                    <Text style={styles.nodeColumnHighlight}>🔗 category_id (FK)</Text>
                    <Text style={styles.nodeColumn}>Composite PK</Text>
                  </View>

                  <Ionicons name="arrow-back" size={18} color="#047857" style={{ marginHorizontal: 8 }} />

                  <View style={styles.nodeBox}>
                    <Text style={styles.nodeTitle}>categories</Text>
                    <Text style={styles.nodeColumn}>🔑 id (PK)</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Why & How It Works in PostgreSQL:</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>The Junction Table:</Text> Relational databases cannot store lists of IDs inside a column cleanly. Instead, an intermediate table (also called Join / Pivot / Junction Table) connects both sides.
                </Text>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>Composite Primary Key:</Text>{' '}
                  <Text style={styles.codeText}>PRIMARY KEY (product_id, category_id)</Text> prevents accidentally attaching the same category twice to a single product.
                </Text>
                <Text style={styles.infoPoint}>
                  • <Text style={styles.boldText}>In Supabase PostgREST:</Text> PostgREST automatically traverses the junction table! When you query <Text style={styles.codeText}>products (*, categories(*))</Text>, Supabase handles the double join behind the scenes!
                </Text>
              </View>

              <Text style={styles.sectionHeader}>SQL Definition:</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>
                  {`CREATE TABLE categories (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#2563EB'
);

CREATE TABLE product_categories (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);`}
                </Text>
              </View>
            </View>
          )}

          {/* TAB 4: Status */}
          {activeTab === 'status' && (
            <View>
              <View style={styles.badgeBanner}>
                <Text style={styles.badgeBannerTitle}>Supabase Schema Verification</Text>
                <Text style={styles.badgeBannerSubtitle}>
                  Checks if all 5 tables exist and reports live row counts from PostgreSQL.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={checkDatabaseStatus}
                disabled={checkingStatus}
              >
                {checkingStatus ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.refreshBtnText}>Check Live Database</Text>
                  </>
                )}
              </TouchableOpacity>

              {schemaData && (
                <View style={styles.statusList}>
                  {Object.entries(schemaData.table_status || {}).map(([table, st]: [string, any]) => (
                    <View key={table} style={styles.statusRow}>
                      <View style={styles.statusInfo}>
                        <Text style={styles.statusTableName}>{table}</Text>
                        <Text style={styles.statusSubtitle}>
                          {table === 'products'
                            ? 'Base Entity'
                            : table === 'product_details'
                            ? '1:1 Specifications'
                            : table === 'reviews'
                            ? '1:M Customer Reviews'
                            : table === 'categories'
                            ? 'M:M Category Dimension'
                            : 'M:M Junction Pivot Table'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          st.exists ? styles.statusPillOnline : styles.statusPillOffline,
                        ]}
                      >
                        <MaterialIcons
                          name={st.exists ? 'check-circle' : 'error'}
                          size={14}
                          color={st.exists ? '#059669' : '#DC2626'}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: st.exists ? '#059669' : '#DC2626' },
                          ]}
                        >
                          {st.exists ? `${st.row_count} rows` : 'Missing'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>How to Run the Migration Script:</Text>
                <Text style={styles.instructionStep}>
                  1. Open your Supabase Dashboard: <Text style={styles.boldText}>https://supabase.com/dashboard</Text>
                </Text>
                <Text style={styles.instructionStep}>
                  2. Navigate to the <Text style={styles.boldText}>SQL Editor</Text> in the left sidebar.
                </Text>
                <Text style={styles.instructionStep}>
                  3. Paste the contents of file <Text style={styles.codeText}>schema_relationships.sql</Text> and click <Text style={styles.boldText}>Run</Text>.
                </Text>
                <Text style={styles.instructionStep}>
                  4. Return to this app and tap <Text style={styles.boldText}>Check Live Database</Text>!
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primaryContainer,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeBanner: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4DBFD',
    marginBottom: 18,
  },
  badgeBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  badgeBannerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  diagramCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  diagramCardCol: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  nodeColumn: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nodeColumnHighlight: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  arrowBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  arrowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  infoPoint: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#F1F5F9',
    fontSize: 12,
  },
  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  codeBlockText: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
  refreshBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    marginBottom: 20,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statusList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusInfo: {
    flex: 1,
  },
  statusTableName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusPillOnline: {
    backgroundColor: '#D1FAE5',
  },
  statusPillOffline: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  instructionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
});
