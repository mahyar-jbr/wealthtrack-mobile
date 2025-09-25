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
  Paragraph,
  Surface,
  Divider
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { assetService } from '../../services/assets';
import { priceService, PortfolioValue } from '../../services/prices';
import { Asset } from '../../types/asset';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const fetchAssetsAndPrices = useCallback(async () => {
    try {
      // Fetch portfolio value (includes assets with prices)
      const portfolio = await priceService.getPortfolioValue();
      setPortfolioValue(portfolio);
      
      // Also fetch basic assets for structure
      const assetsData = await assetService.getAssets();
      setAssets(assetsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // If price fetch fails, at least show assets
      try {
        const assetsData = await assetService.getAssets();
        setAssets(assetsData);
      } catch (assetError: any) {
        Alert.alert('Error', assetError.message || 'Failed to load assets');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPricesLoading(false);
    }
  }, []);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchAssetsAndPrices();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setPricesLoading(true);
    fetchAssetsAndPrices();
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
      // Refresh portfolio value
      fetchAssetsAndPrices();
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

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Get asset with price data
  const getAssetWithPrice = (asset: Asset) => {
    return portfolioValue?.assets.find(a => a.id === asset.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>My Portfolio</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
          </Text>
        </View>

        {/* Portfolio Summary Card */}
        {portfolioValue && assets.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Total Portfolio Value
              </Text>
              <Text variant="headlineLarge" style={styles.totalValue}>
                {formatCurrency(portfolioValue.totalValue)}
              </Text>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Total Cost
                  </Text>
                  <Text variant="bodyLarge">
                    {formatCurrency(portfolioValue.totalCost)}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Total Gain/Loss
                  </Text>
                  <Text 
                    variant="bodyLarge"
                    style={[
                      styles.gainLoss,
                      { color: portfolioValue.totalGainLoss >= 0 ? '#4CAF50' : '#F44336' }
                    ]}
                  >
                    {formatCurrency(portfolioValue.totalGainLoss)}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Return
                  </Text>
                  <Text 
                    variant="bodyLarge"
                    style={[
                      styles.gainLoss,
                      { color: portfolioValue.totalGainLossPercent >= 0 ? '#4CAF50' : '#F44336' }
                    ]}
                  >
                    {formatPercent(portfolioValue.totalGainLossPercent)}
                  </Text>
                </View>
              </View>
              
              {pricesLoading && (
                <View style={styles.priceUpdateIndicator}>
                  <ActivityIndicator size="small" />
                  <Text variant="bodySmall" style={styles.priceUpdateText}>
                    Updating prices...
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

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
            {assets.map((asset) => {
              const priceData = getAssetWithPrice(asset);
              return (
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
                    
                    <Divider style={styles.divider} />
                    
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
                      
                      {priceData && (
                        <>
                          <View style={styles.detailRow}>
                            <Text variant="bodyMedium" style={styles.detailLabel}>
                              Current Price:
                            </Text>
                            <Text variant="bodyMedium" style={styles.detailValue}>
                              {formatCurrency(priceData.currentPrice)}
                            </Text>
                          </View>
                          
                          <View style={styles.detailRow}>
                            <Text variant="bodyMedium" style={styles.detailLabel}>
                              Current Value:
                            </Text>
                            <Text variant="titleMedium" style={styles.detailValueBold}>
                              {formatCurrency(priceData.currentValue)}
                            </Text>
                          </View>
                          
                          <View style={styles.detailRow}>
                            <Text variant="bodyMedium" style={styles.detailLabel}>
                              Gain/Loss:
                            </Text>
                            <Text 
                              variant="titleMedium" 
                              style={[
                                styles.detailValueBold,
                                { color: priceData.gainLoss >= 0 ? '#4CAF50' : '#F44336' }
                              ]}
                            >
                              {formatCurrency(priceData.gainLoss)} ({formatPercent(priceData.gainLossPercent)})
                            </Text>
                          </View>
                          
                          {priceData.lastPriceUpdate && (
                            <Text variant="bodySmall" style={styles.lastUpdate}>
                              Last updated: {new Date(priceData.lastPriceUpdate).toLocaleTimeString()}
                            </Text>
                          )}
                        </>
                      )}
                      
                      {!priceData && (
                        <View style={styles.noPriceContainer}>
                          <Text variant="bodySmall" style={styles.noPriceText}>
                            Price data unavailable
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
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
  summaryCard: {
    margin: 16,
    backgroundColor: '#1E88E5',
  },
  summaryTitle: {
    color: 'white',
    marginBottom: 8,
  },
  totalValue: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  gainLoss: {
    fontWeight: 'bold',
  },
  priceUpdateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  priceUpdateText: {
    marginLeft: 8,
    color: 'rgba(255,255,255,0.7)',
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
    marginBottom: 8,
  },
  typeChip: {
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  assetDetails: {
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
  lastUpdate: {
    opacity: 0.5,
    marginTop: 8,
  },
  noPriceContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  noPriceText: {
    color: '#E65100',
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