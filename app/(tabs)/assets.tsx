import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { assetService } from '../../services/assets';
import { priceService, PortfolioValue } from '../../services/prices';
import { Asset } from '../../types/asset';
import { colors } from '../../constants/theme';

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const router = useRouter();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    }).format(num);
  };

  // Get asset with price data
  const getAssetWithPrice = (asset: Asset) => {
    return portfolioValue?.assets.find(a => a.id === asset.id);
  };

  // Sort assets by current value (highest first)
  const sortedAssets = [...assets].sort((a, b) => {
    const aPrice = getAssetWithPrice(a);
    const bPrice = getAssetWithPrice(b);
    const aValue = aPrice?.currentValue || 0;
    const bValue = bPrice?.currentValue || 0;
    return bValue - aValue;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>LOADING ASSETS...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>MY PORTFOLIO</Text>
          <Text style={styles.title}>
            {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
          </Text>
        </View>
        <IconButton
          icon="plus-circle-outline"
          iconColor={colors.black}
          size={28}
          onPress={() => router.push('/add-asset')}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.black}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Summary Card */}
        {portfolioValue && assets.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL VALUE</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(portfolioValue.totalValue)}
            </Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.metricLabel}>COST BASIS</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(portfolioValue.totalCost)}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.metricLabel}>GAIN/LOSS</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: portfolioValue.totalGainLoss >= 0 ? colors.profit : colors.loss }
                  ]}
                >
                  {formatCurrency(portfolioValue.totalGainLoss)}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.metricLabel}>RETURN</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: portfolioValue.totalGainLossPercent >= 0 ? colors.profit : colors.loss }
                  ]}
                >
                  {formatPercent(portfolioValue.totalGainLossPercent)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Empty State */}
        {assets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <IconButton
                icon="chart-line-variant"
                size={48}
                iconColor={colors.textTertiary}
              />
            </View>
            <Text style={styles.emptyTitle}>NO ASSETS YET</Text>
            <Text style={styles.emptyText}>
              Start building your portfolio by adding your first investment
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-asset')}
            >
              <Text style={styles.emptyButtonText}>ADD YOUR FIRST ASSET</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Assets List */
          <View style={styles.assetsList}>
            <Text style={styles.sectionTitle}>ALL HOLDINGS</Text>

            {sortedAssets.map((asset) => {
              const priceData = getAssetWithPrice(asset);
              const isProfit = priceData && priceData.gainLoss >= 0;

              return (
                <TouchableOpacity
                  key={asset.id}
                  style={styles.assetCard}
                  onPress={() => router.push(`/asset-detail?id=${asset.id}`)}
                  activeOpacity={0.7}
                >
                  {/* Asset Header */}
                  <View style={styles.assetHeader}>
                    <View style={styles.assetIcon}>
                      <Text style={styles.assetIconText}>
                        {asset.symbol.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.assetInfo}>
                      <View style={styles.assetTitleRow}>
                        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeLabel}>{asset.type}</Text>
                        </View>
                      </View>
                      <Text style={styles.assetName}>{asset.name}</Text>
                    </View>

                    <IconButton
                      icon="delete-outline"
                      size={20}
                      iconColor={colors.textSecondary}
                      onPress={() => handleDeletePress(asset)}
                      style={styles.deleteButton}
                    />
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Asset Details Grid */}
                  <View style={styles.detailsGrid}>
                    {/* Left Column */}
                    <View style={styles.detailColumn}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>QUANTITY</Text>
                        <Text style={styles.detailValue}>{formatNumber(asset.quantity)}</Text>
                      </View>

                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>PURCHASE PRICE</Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(asset.purchase_price)}
                        </Text>
                      </View>

                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>COST BASIS</Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(asset.quantity * asset.purchase_price)}
                        </Text>
                      </View>
                    </View>

                    {/* Right Column */}
                    {priceData ? (
                      <View style={styles.detailColumn}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>CURRENT PRICE</Text>
                          <Text style={styles.detailValue}>
                            {formatCurrency(priceData.currentPrice)}
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>CURRENT VALUE</Text>
                          <Text style={styles.detailValueLarge}>
                            {formatCurrency(priceData.currentValue)}
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>GAIN/LOSS</Text>
                          <View style={styles.gainLossRow}>
                            <Text
                              style={[
                                styles.detailValueLarge,
                                { color: isProfit ? colors.profit : colors.loss }
                              ]}
                            >
                              {formatCurrency(priceData.gainLoss)}
                            </Text>
                            <View style={[
                              styles.percentBadge,
                              { backgroundColor: isProfit ? colors.profitBg : colors.lossBg }
                            ]}>
                              <IconButton
                                icon={isProfit ? 'trending-up' : 'trending-down'}
                                size={12}
                                iconColor={isProfit ? colors.profit : colors.loss}
                                style={styles.trendIcon}
                              />
                              <Text style={[
                                styles.percentText,
                                { color: isProfit ? colors.profit : colors.loss }
                              ]}>
                                {formatPercent(priceData.gainLossPercent)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.detailColumn}>
                        <View style={styles.noPriceContainer}>
                          <IconButton
                            icon="alert-circle-outline"
                            size={24}
                            iconColor={colors.textTertiary}
                          />
                          <Text style={styles.noPriceText}>Price data unavailable</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Last Update Time */}
                  {priceData?.lastPriceUpdate && (
                    <View style={styles.updateInfo}>
                      <IconButton
                        icon="clock-outline"
                        size={12}
                        iconColor={colors.textTertiary}
                        style={styles.clockIcon}
                      />
                      <Text style={styles.updateText}>
                        Last updated {new Date(priceData.lastPriceUpdate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>DELETE ASSET</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete <Text style={styles.dialogAssetName}>{assetToDelete?.name}</Text> ({assetToDelete?.symbol})?
            </Text>
            <Text style={styles.dialogWarning}>This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              onPress={() => setDeleteDialogVisible(false)}
              style={styles.dialogButton}
            >
              <Text style={styles.dialogButtonTextCancel}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteConfirm}
              style={[styles.dialogButton, styles.dialogButtonDelete]}
            >
              <Text style={styles.dialogButtonTextDelete}>DELETE</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: -1.5,
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -2,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  metricLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  assetsList: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  assetCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: 0.5,
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
  assetSymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  typeLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  assetName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  detailColumn: {
    flex: 1,
    gap: 16,
  },
  detailItem: {
    gap: 6,
  },
  detailLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.3,
  },
  detailValueLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: -0.5,
  },
  gainLossRow: {
    gap: 8,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingRight: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  trendIcon: {
    margin: 0,
    padding: 0,
  },
  percentText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  noPriceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noPriceText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clockIcon: {
    margin: 0,
    marginRight: 4,
  },
  updateText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  bottomSpacer: {
    height: 32,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dialogText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  dialogAssetName: {
    fontWeight: 'bold',
    color: colors.black,
  },
  dialogWarning: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogButtonDelete: {
    backgroundColor: colors.loss,
    borderColor: colors.loss,
  },
  dialogButtonTextCancel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  dialogButtonTextDelete: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
