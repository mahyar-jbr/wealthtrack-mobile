import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { assetService } from '../services/assets';
import { priceService } from '../services/prices';
import { Asset } from '../types/asset';
import { colors } from '../constants/theme';

export default function AssetDetailScreen() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();
  const assetId = params.id as string;

  useEffect(() => {
    fetchAssetDetails();
  }, [assetId]);

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      // Fetch asset data
      const assets = await assetService.getAssets();
      const foundAsset = assets.find(a => a.id === assetId);

      if (!foundAsset) {
        Alert.alert('Error', 'Asset not found');
        router.back();
        return;
      }

      setAsset(foundAsset);

      // Fetch price data
      try {
        const portfolio = await priceService.getPortfolioValue();
        const assetPrice = portfolio.assets.find(a => a.id === assetId);
        setPriceData(assetPrice);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load asset');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;

    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete ${asset.name} (${asset.symbol})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assetService.deleteAsset(asset.id);
              Alert.alert('Success', 'Asset deleted successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete asset');
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>LOADING ASSET...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!asset) {
    return null;
  }

  const isProfit = priceData && priceData.gainLoss >= 0;
  const costBasis = asset.quantity * asset.purchase_price;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.black}
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <IconButton
              icon="delete-outline"
              iconColor={colors.white}
              size={20}
              style={styles.deleteIcon}
            />
            <Text style={styles.deleteButtonText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.assetIcon}>
            <Text style={styles.assetIconText}>
              {asset.symbol.substring(0, 2).toUpperCase()}
            </Text>
          </View>

          <View style={styles.assetTitleContainer}>
            <Text style={styles.assetSymbol}>{asset.symbol}</Text>
            <Text style={styles.assetName}>{asset.name}</Text>
          </View>

          <View style={styles.typeBadge}>
            <Text style={styles.typeLabel}>{asset.type}</Text>
          </View>
        </View>

        {/* Current Value Card */}
        {priceData ? (
          <View style={styles.valueCard}>
            <Text style={styles.cardLabel}>CURRENT VALUE</Text>
            <Text style={styles.currentValue}>
              {formatCurrency(priceData.currentValue)}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {formatCurrency(priceData.currentPrice)} per unit
              </Text>
            </View>

            {/* Gain/Loss Section */}
            <View style={styles.gainLossSection}>
              <View style={styles.gainLossHeader}>
                <Text style={styles.gainLossLabel}>TOTAL GAIN/LOSS</Text>
                <View style={[
                  styles.trendBadge,
                  { backgroundColor: isProfit ? colors.profitBg : colors.lossBg }
                ]}>
                  <IconButton
                    icon={isProfit ? 'trending-up' : 'trending-down'}
                    size={16}
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

              <Text style={[
                styles.gainLossValue,
                { color: isProfit ? colors.profit : colors.loss }
              ]}>
                {formatCurrency(priceData.gainLoss)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noPriceCard}>
            <IconButton
              icon="alert-circle-outline"
              size={40}
              iconColor={colors.textTertiary}
            />
            <Text style={styles.noPriceTitle}>PRICE DATA UNAVAILABLE</Text>
            <Text style={styles.noPriceText}>
              Real-time pricing is not available for this asset
            </Text>
          </View>
        )}

        {/* Holdings Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOLDINGS DETAILS</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>QUANTITY</Text>
                <Text style={styles.infoValue}>{formatNumber(asset.quantity)}</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>PURCHASE PRICE</Text>
                <Text style={styles.infoValue}>{formatCurrency(asset.purchase_price)}</Text>
              </View>
            </View>

            <View style={styles.horizontalDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>COST BASIS</Text>
                <Text style={styles.infoValue}>{formatCurrency(costBasis)}</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>PURCHASE DATE</Text>
                <Text style={styles.infoValue}>
                  {new Date(asset.purchase_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price Information (if available) */}
        {priceData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRICE BREAKDOWN</Text>

            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Current Price</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(priceData.currentPrice)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Purchase Price</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(asset.purchase_price)}
                </Text>
              </View>

              <View style={styles.breakdownDivider} />

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Price Change</Text>
                <Text style={[
                  styles.breakdownValue,
                  { color: isProfit ? colors.profit : colors.loss }
                ]}>
                  {formatCurrency(priceData.currentPrice - asset.purchase_price)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Price Change %</Text>
                <Text style={[
                  styles.breakdownValue,
                  { color: isProfit ? colors.profit : colors.loss }
                ]}>
                  {formatPercent(
                    ((priceData.currentPrice - asset.purchase_price) / asset.purchase_price) * 100
                  )}
                </Text>
              </View>
            </View>

            {priceData.lastPriceUpdate && (
              <View style={styles.updateInfo}>
                <IconButton
                  icon="clock-outline"
                  size={14}
                  iconColor={colors.textTertiary}
                  style={styles.clockIcon}
                />
                <Text style={styles.updateText}>
                  Last updated {new Date(priceData.lastPriceUpdate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    margin: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.loss,
    borderRadius: 12,
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteIcon: {
    margin: 0,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  assetIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  assetIconText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -1,
  },
  assetTitleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  assetSymbol: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  typeLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  valueCard: {
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
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -2,
    marginBottom: 8,
  },
  priceRow: {
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gainLossSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  gainLossHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gainLossLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trendIcon: {
    margin: 0,
    padding: 0,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  gainLossValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  noPriceCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noPriceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  noPriceText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoCard: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    gap: 8,
  },
  infoLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.5,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray200,
    marginHorizontal: 16,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 20,
  },
  breakdownCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    backgroundColor: colors.white,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.5,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
    height: 40,
  },
});
