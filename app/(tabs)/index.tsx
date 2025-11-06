import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-gifted-charts';
import { priceService, PortfolioValue } from '../../services/prices';
import { useAuth } from '../../contexts/AuthContext';
import { colors, shadows } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [portfolioData, setPortfolioData] = useState<PortfolioValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const fetchPortfolioData = useCallback(async () => {
    try {
      const data = await priceService.getPortfolioValue();
      setPortfolioData(data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPortfolioData();
    }, [fetchPortfolioData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolioData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // Advanced Analytics
  const analytics = useMemo(() => {
    if (!portfolioData || portfolioData.assets.length === 0) {
      return {
        topPerformer: null,
        worstPerformer: null,
        avgReturn: 0,
        volatility: 0,
        typeDistribution: {},
        riskScore: 0,
        diversificationScore: 0,
        totalAssets: 0,
        totalGainers: 0,
        totalLosers: 0
      };
    }

    const sorted = [...portfolioData.assets].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    const avgReturn = portfolioData.assets.reduce((sum, a) => sum + a.gainLossPercent, 0) / portfolioData.assets.length;

    // Calculate volatility (standard deviation of returns)
    const variance = portfolioData.assets.reduce((sum, a) =>
      sum + Math.pow(a.gainLossPercent - avgReturn, 2), 0
    ) / portfolioData.assets.length;
    const volatility = Math.sqrt(variance);

    // Type distribution
    const typeDistribution: Record<string, number> = {};
    portfolioData.assets.forEach(asset => {
      typeDistribution[asset.type] = (typeDistribution[asset.type] || 0) + asset.currentValue;
    });

    // Risk score (0-100, based on volatility and concentration)
    const concentration = Math.max(...Object.values(typeDistribution)) / portfolioData.totalValue;
    const riskScore = Math.min(100, (volatility * 5) + (concentration * 50));

    // Diversification score (0-100, higher is better)
    const numTypes = Object.keys(typeDistribution).length;
    const diversificationScore = Math.min(100, (numTypes * 20) + ((1 - concentration) * 30));

    const gainers = portfolioData.assets.filter(a => a.gainLoss > 0).length;
    const losers = portfolioData.assets.filter(a => a.gainLoss < 0).length;

    return {
      topPerformer: sorted[0],
      worstPerformer: sorted[sorted.length - 1],
      avgReturn,
      volatility,
      typeDistribution,
      riskScore,
      diversificationScore,
      totalAssets: portfolioData.assets.length,
      totalGainers: gainers,
      totalLosers: losers
    };
  }, [portfolioData]);

  // Prepare chart data for asset allocation
  const chartData = useMemo(() => {
    if (!portfolioData || portfolioData.assets.length === 0) return [];

    const typeColors: Record<string, string> = {
      'STOCK': '#000000',
      'CRYPTO': '#2A2A2A',
      'ETF': '#525252',
      'BOND': '#737373',
      'OTHER': '#A3A3A3'
    };

    return Object.entries(analytics.typeDistribution).map(([type, value]) => ({
      value: value,
      color: typeColors[type] || '#D4D4D4',
      text: '',
      label: type
    }));
  }, [portfolioData, analytics.typeDistribution]);

  const getAssetDistribution = () => {
    if (!portfolioData || portfolioData.assets.length === 0) return [];

    const totalValue = portfolioData.totalValue;
    return portfolioData.assets
      .map(asset => ({
        ...asset,
        percentage: (asset.currentValue / totalValue) * 100
      }))
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 6);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'STOCK': 'chart-line',
      'CRYPTO': 'bitcoin',
      'ETF': 'chart-box-outline',
      'BOND': 'certificate-outline',
    };
    return icons[type] || 'cash';
  };

  // Get user's first name from database
  const getUserName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    // Fallback to email prefix if first_name is not set
    if (user?.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'User';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>LOADING PORTFOLIO...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const distribution = getAssetDistribution();
  const hasAssets = portfolioData && portfolioData.assets.length > 0;
  const isPositive = portfolioData && portfolioData.totalGainLoss >= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.white} />
        }
      >
        {/* Premium Hero Section */}
        <LinearGradient
          colors={['#000000', '#1A1A1A', '#000000']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Top Bar */}
          <View style={styles.heroTop}>
            <View style={styles.userBadge}>
              <View style={styles.avatar}>
                <IconButton
                  icon="account-circle"
                  iconColor={colors.black}
                  size={32}
                  style={{ margin: 0 }}
                />
              </View>
              <View>
                <Text style={styles.greeting}>PORTFOLIO</Text>
                <Text style={styles.username}>{getUserName()}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/add-asset')}>
                <IconButton icon="plus" iconColor={colors.black} size={18} style={styles.iconButtonInner} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={logout}>
                <IconButton icon="logout" iconColor={colors.black} size={18} style={styles.iconButtonInner} />
              </TouchableOpacity>
            </View>
          </View>

          {!hasAssets ? (
            /* Premium Empty State */
            <View style={styles.emptyHero}>
              <View style={styles.emptyIconContainer}>
                <IconButton icon="shield-star-outline" size={56} iconColor={colors.white} />
              </View>
              <Text style={styles.emptyTitle}>START YOUR WEALTH JOURNEY</Text>
              <Text style={styles.emptyText}>
                Track investments, analyze performance, and build your financial future with confidence
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/add-asset')}
                style={styles.emptyButton}
              >
                <IconButton icon="rocket-launch" iconColor={colors.black} size={18} style={styles.emptyButtonIcon} />
                <Text style={styles.emptyButtonText}>BEGIN INVESTING</Text>
                <IconButton icon="arrow-right" iconColor={colors.black} size={18} style={styles.emptyButtonIcon} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Main Value Display */}
              <View style={styles.valueDisplay}>
                <Text style={styles.totalLabel}>NET WORTH</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(portfolioData.totalValue)}
                </Text>

                {/* Performance Badge with Glow */}
                <View style={[
                  styles.performanceBadgeContainer,
                  isPositive ? styles.glowGreen : styles.glowRed
                ]}>
                  <View style={[
                    styles.performanceBadge,
                    { backgroundColor: isPositive ? colors.profit : colors.loss }
                  ]}>
                    <IconButton
                      icon={isPositive ? 'trending-up' : 'trending-down'}
                      iconColor={colors.white}
                      size={16}
                      style={styles.badgeIcon}
                    />
                    <Text style={styles.badgeAmount}>
                      {formatCurrencyDetailed(Math.abs(portfolioData.totalGainLoss))}
                    </Text>
                    <Text style={styles.badgePercent}>
                      {formatPercent(portfolioData.totalGainLossPercent)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.miniStatCard}>
                  <IconButton icon="wallet-outline" iconColor={colors.white} size={20} style={styles.miniStatIcon} />
                  <Text style={styles.miniStatValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{formatCompactNumber(portfolioData.totalCost)}</Text>
                  <Text style={styles.miniStatLabel} numberOfLines={1}>COST</Text>
                </View>
                <View style={styles.miniStatCard}>
                  <IconButton icon="chart-line" iconColor={isPositive ? colors.profit : colors.loss} size={20} style={styles.miniStatIcon} />
                  <Text style={[styles.miniStatValue, { color: isPositive ? colors.profit : colors.loss }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                    {formatPercent(portfolioData.totalGainLossPercent)}
                  </Text>
                  <Text style={styles.miniStatLabel} numberOfLines={1}>GAIN</Text>
                </View>
                <View style={styles.miniStatCard}>
                  <IconButton icon="layers-outline" iconColor={colors.white} size={20} style={styles.miniStatIcon} />
                  <Text style={styles.miniStatValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{analytics.totalAssets}</Text>
                  <Text style={styles.miniStatLabel} numberOfLines={1}>ITEMS</Text>
                </View>
                <View style={styles.miniStatCard}>
                  <IconButton icon="gauge" iconColor={colors.white} size={20} style={styles.miniStatIcon} />
                  <Text style={styles.miniStatValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{analytics.avgReturn.toFixed(1)}%</Text>
                  <Text style={styles.miniStatLabel} numberOfLines={1}>AVG</Text>
                </View>
              </View>
            </>
          )}
        </LinearGradient>

        {hasAssets && (
          <>
            {/* Portfolio Distribution Chart */}
            <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>ASSET ALLOCATION</Text>
                  <Text style={styles.sectionSubtitle}>Portfolio breakdown</Text>
                </View>

                <View style={styles.chartContainer}>
                  <View style={styles.chartWrapper}>
                    <PieChart
                      data={chartData}
                      donut
                      radius={90}
                      innerRadius={60}
                      centerLabelComponent={() => (
                        <View style={styles.chartCenterLabel}>
                          <Text style={styles.chartCenterValue}>{chartData.length}</Text>
                          <Text style={styles.chartCenterText}>Types</Text>
                        </View>
                      )}
                      strokeColor={colors.white}
                      strokeWidth={3}
                      showText={false}
                      focusOnPress
                      sectionAutoFocus
                    />
                  </View>

                  {/* Chart Legend */}
                  <View style={styles.chartLegend}>
                    {chartData.map((item, index) => {
                      const percentage = ((item.value / portfolioData!.totalValue) * 100).toFixed(1);
                      return (
                        <View key={index} style={styles.legendItem}>
                          <View style={styles.legendLeft}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text style={styles.legendLabel}>{item.label}</Text>
                          </View>
                          <View style={styles.legendRight}>
                            <Text style={styles.legendValue}>{formatCompactNumber(item.value)}</Text>
                            <Text style={styles.legendPercent}>{percentage}%</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
            </View>

            {/* Top Holdings */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TOP HOLDINGS</Text>
                <Text style={styles.sectionSubtitle}>Largest positions</Text>
              </View>

              <View style={styles.holdingsList}>
                {distribution.map((asset, index) => {
                  const isProfit = asset.gainLoss >= 0;
                  return (
                    <TouchableOpacity
                      key={asset.id}
                      style={styles.holdingCard}
                      onPress={() => router.push('/(tabs)/assets')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.holdingHeader}>
                        <Text style={styles.holdingSymbol}>{asset.symbol}</Text>
                        <Text style={styles.holdingValue}>{formatCurrency(asset.currentValue)}</Text>
                      </View>
                      <View style={styles.holdingMeta}>
                        <Text style={styles.holdingName} numberOfLines={1}>{asset.name}</Text>
                        <View style={styles.holdingChange}>
                          <IconButton
                            icon={isProfit ? 'arrow-top-right' : 'arrow-bottom-right'}
                            iconColor={isProfit ? colors.profit : colors.loss}
                            size={12}
                            style={styles.changeIcon}
                          />
                          <Text style={[styles.holdingChangeText, { color: isProfit ? colors.profit : colors.loss }]}>
                            {formatPercent(asset.gainLossPercent)}
                          </Text>
                        </View>
                      </View>

                      {/* Allocation Bar */}
                      <View style={styles.allocationBar}>
                        <View style={[styles.allocationFill, { width: `${asset.percentage}%` }]} />
                        <Text style={styles.allocationText}>{asset.percentage.toFixed(1)}%</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {portfolioData.assets.length > 6 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/(tabs)/assets')}
                >
                  <Text style={styles.viewAllText}>View All {portfolioData.assets.length} Assets</Text>
                  <IconButton icon="arrow-right" iconColor={colors.textSecondary} size={16} style={styles.viewAllIcon} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

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
    letterSpacing: 1.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: '600',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonInner: {
    margin: 0,
  },

  // Empty Hero State
  emptyHero: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  emptyButtonIcon: {
    margin: 0,
  },
  emptyButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Value Display
  valueDisplay: {
    alignItems: 'center',
    marginBottom: 28,
  },
  totalLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: -3.5,
    marginBottom: 20,
  },
  performanceBadgeContainer: {
    borderRadius: 24,
    padding: 2,
  },
  glowGreen: {
    shadowColor: colors.profit,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  glowRed: {
    shadowColor: colors.loss,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  performanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
  },
  badgeIcon: {
    margin: 0,
  },
  badgeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: -0.5,
  },
  badgePercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: -0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  miniStatIcon: {
    margin: 0,
    marginBottom: 6,
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 2,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  miniStatLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Market Bar
  marketBar: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  marketItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  marketDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  marketIcon: {
    margin: 0,
  },
  marketLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  marketValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.black,
  },
  marketDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },

  // Section
  section: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.black,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Health Cards
  healthCards: {
    flexDirection: 'row',
    gap: 12,
  },
  healthCard: {
    flex: 1,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
  },
  healthCardRisk: {
    backgroundColor: colors.lossBg,
    borderColor: colors.loss + '30',
  },
  healthCardDiversity: {
    backgroundColor: colors.profitBg,
    borderColor: colors.profit + '30',
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  healthCardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  healthScore: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  healthScoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.white,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthCardFooter: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Type Distribution
  typeDistributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeCardIcon: {
    marginBottom: 8,
  },
  typeCardType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  typeCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  typeCardPercentage: {
    backgroundColor: colors.black,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeCardPercentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },

  // Holdings List
  holdingsList: {
    gap: 12,
  },
  holdingCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
  },
  rankBadgeSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBadgeBronze: {
    backgroundColor: '#CD7F32',
  },
  rankBadgeDefault: {
    backgroundColor: colors.gray300,
  },
  rankIcon: {
    margin: 0,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  holdingSymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -0.5,
  },
  holdingValue: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.3,
  },
  holdingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  holdingName: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  holdingChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    margin: 0,
  },
  holdingChangeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  allocationBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  allocationFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 4,
  },
  allocationText: {
    position: 'absolute',
    right: 8,
    top: -15,
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  viewAllIcon: {
    margin: 0,
  },

  // Performer Cards
  performerCards: {
    gap: 12,
  },
  performerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  performerCardWin: {
    borderColor: colors.profit + '30',
  },
  performerCardLose: {
    borderColor: colors.loss + '30',
  },
  performerGradient: {
    padding: 20,
  },
  performerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  performerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  performerReturn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performerReturnIcon: {
    margin: 0,
  },
  performerReturnValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  performerContent: {
    marginBottom: 16,
  },
  performerSymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  performerName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  performerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performerStat: {
    flex: 1,
  },
  performerStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  performerStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  performerStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actionGridItem: {
    width: '23%',
    alignItems: 'center',
    gap: 8,
  },
  actionGridIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.profitBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  footerIcon: {
    margin: 0,
  },
  footerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.profit,
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 40,
  },

  // Chart Section Styles
  chartSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.white,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  chartCenterLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -1,
  },
  chartCenterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  chartLegend: {
    marginTop: 24,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 45,
    textAlign: 'right',
  },
});
