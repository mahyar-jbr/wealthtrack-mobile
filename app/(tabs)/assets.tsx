import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  FAB, 
  IconButton, 
  Chip, 
  ActivityIndicator,
  useTheme,
  Portal,
  Dialog,
  Button,
  Paragraph
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { assetService } from '../../services/assets';
import { Asset } from '../../types/asset';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const fetchAssets = useCallback(async () => {
    try {
      const data = await assetService.getAssets();
      setAssets(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load assets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  const handleDeletePress = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      await assetService.deleteAsset(assetToDelete.id);
      setAssets(assets.filter(a => a.id !== assetToDelete.id));
      Alert.alert('Success', 'Asset deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete asset');
    } finally {
      setDeleteDialogVisible(false);
      setAssetToDelete(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CRYPTO': return '#FF6B6B';
      case 'STOCK': return '#4ECDC4';
      case 'ETF': return '#45B7D1';
      case 'BOND': return '#96CEB4';
      default: return '#95A5A6';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>My Assets</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
          </Text>
        </View>

        {assets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No Assets Yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Start building your portfolio by adding your first asset
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.assetsList}>
            {assets.map((asset) => (
              <Card key={asset.id} style={styles.assetCard}>
                <Card.Content>
                  <View style={styles.assetHeader}>
                    <View style={styles.assetInfo}>
                      <View style={styles.assetTitleRow}>
                        <Text variant="titleMedium" style={styles.assetName}>
                          {asset.name}
                        </Text>
                        <Chip 
                          mode="flat" 
                          style={[styles.typeChip, { backgroundColor: getTypeColor(asset.type) }]}
                          textStyle={styles.chipText}
                        >
                          {asset.type}
                        </Chip>
                      </View>
                      <Text variant="bodyLarge" style={styles.assetSymbol}>
                        {asset.symbol}
                      </Text>
                    </View>
                    <IconButton
                      icon="delete"
                      size={24}
                      onPress={() => handleDeletePress(asset)}
                    />
                  </View>
                  
                  <View style={styles.assetDetails}>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.detailLabel}>
                        Quantity:
                      </Text>
                      <Text variant="bodyMedium" style={styles.detailValue}>
                        {asset.quantity}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.detailLabel}>
                        Purchase Price:
                      </Text>
                      <Text variant="bodyMedium" style={styles.detailValue}>
                        {formatCurrency(asset.purchase_price)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.detailLabel}>
                        Total Value:
                      </Text>
                      <Text variant="bodyMedium" style={styles.detailValueBold}>
                        {formatCurrency(asset.quantity * asset.purchase_price)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-asset')}
        label="Add Asset"
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Asset</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete {assetToDelete?.name} ({assetToDelete?.symbol})?
            </Paragraph>
            <Paragraph>This action cannot be undone.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteConfirm} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  assetsList: {
    padding: 16,
    gap: 12,
  },
  assetCard: {
    marginBottom: 8,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetInfo: {
    flex: 1,
  },
  assetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  assetName: {
    fontWeight: '600',
  },
  assetSymbol: {
    opacity: 0.8,
    marginBottom: 12,
  },
  typeChip: {
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  assetDetails: {
    marginTop: 8,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    opacity: 0.7,
  },
  detailValue: {
    fontWeight: '500',
  },
  detailValueBold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyCard: {
    margin: 16,
    backgroundColor: 'white',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});