import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';

interface PortfolioPieChartProps {
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    currentValue: number;
  }>;
}

const { width } = Dimensions.get('window');
const chartSize = width - 64;

export default function PortfolioPieChart({ assets }: PortfolioPieChartProps) {
  // Calculate total value
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  // Color palette for the chart
  const colors = [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#FFEB3B', // Yellow
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
  ];

  // Prepare data for pie chart
  const chartData = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.currentValue,
    color: colors[index % colors.length],
    legendFontColor: '#333',
    legendFontSize: 12,
    percentage: ((asset.currentValue / totalValue) * 100).toFixed(1)
  }));

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (assets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium" style={styles.emptyText}>
          No assets to display
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={chartSize}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />
      
      {/* Custom Legend */}
      <View style={styles.legendContainer}>
        {assets.map((asset, index) => (
          <View key={asset.id} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
            <View style={styles.legendText}>
              <Text variant="bodyMedium" style={styles.legendSymbol}>
                {asset.symbol} ({((asset.currentValue / totalValue) * 100).toFixed(1)}%)
              </Text>
              <Text variant="bodySmall" style={styles.legendValue}>
                {formatCurrency(asset.currentValue)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendSymbol: {
    fontWeight: '600',
    fontSize: 13,
  },
  legendValue: {
    opacity: 0.7,
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
  },
});