import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, ActivityIndicator, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from "@react-native-community/datetimepicker";
import { assetService } from '../services/assets';
import { AssetType } from '../types/asset';
import { colors } from '../constants/theme';

export default function AddAssetScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form fields
  const [assetType, setAssetType] = useState<AssetType>('STOCK');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());

  // Validation errors
  const [errors, setErrors] = useState({
    symbol: '',
    name: '',
    quantity: '',
    purchasePrice: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      symbol: '',
      name: '',
      quantity: '',
      purchasePrice: ''
    };

    if (!symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
      isValid = false;
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
      isValid = false;
    }

    if (!purchasePrice || parseFloat(purchasePrice) < 0) {
      newErrors.purchasePrice = 'Purchase price must be 0 or greater';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await assetService.createAsset({
        type: assetType,
        symbol: symbol.toUpperCase(),
        name: name.trim(),
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchasePrice),
        purchase_date: purchaseDate.toISOString()
      });

      Alert.alert('Success', 'Asset added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderSymbol = () => {
    switch (assetType) {
      case 'CRYPTO': return 'BTC, ETH, SOL...';
      case 'STOCK': return 'AAPL, GOOGL, TSLA...';
      case 'ETF': return 'SPY, QQQ, VTI...';
      case 'BOND': return 'Treasury, Corporate...';
      default: return 'Enter symbol...';
    }
  };

  const getPlaceholderName = () => {
    switch (assetType) {
      case 'CRYPTO': return 'Bitcoin, Ethereum...';
      case 'STOCK': return 'Apple Inc., Google...';
      case 'ETF': return 'SPDR S&P 500...';
      case 'BOND': return 'US Treasury Bond...';
      default: return 'Asset name...';
    }
  };

  const totalInvestment = quantity && purchasePrice
    ? parseFloat(quantity) * parseFloat(purchasePrice)
    : 0;

  const assetTypes: { value: AssetType; label: string; icon: string }[] = [
    { value: 'STOCK', label: 'Stock', icon: 'chart-line' },
    { value: 'CRYPTO', label: 'Crypto', icon: 'bitcoin' },
    { value: 'ETF', label: 'ETF', icon: 'chart-box' },
    { value: 'BOND', label: 'Bond', icon: 'certificate' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.black}
            size={24}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View>
            <Text style={styles.greeting}>ADD NEW ASSET</Text>
            <Text style={styles.title}>Build Your Portfolio</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Asset Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECT ASSET TYPE</Text>
            <View style={styles.typeGrid}>
              {assetTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    assetType === type.value && styles.typeCardActive
                  ]}
                  onPress={() => setAssetType(type.value)}
                >
                  <IconButton
                    icon={type.icon}
                    iconColor={assetType === type.value ? colors.white : colors.black}
                    size={24}
                    style={styles.typeIcon}
                  />
                  <Text style={[
                    styles.typeLabel,
                    assetType === type.value && styles.typeLabelActive
                  ]}>
                    {type.label}
                  </Text>
                  {assetType === type.value && (
                    <View style={styles.checkmark}>
                      <IconButton
                        icon="check-circle"
                        iconColor={colors.white}
                        size={16}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Asset Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ASSET DETAILS</Text>

            {/* Symbol Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>SYMBOL *</Text>
              <TextInput
                value={symbol}
                onChangeText={(text) => {
                  setSymbol(text);
                  if (errors.symbol) setErrors({ ...errors, symbol: '' });
                }}
                mode="outlined"
                placeholder={getPlaceholderSymbol()}
                autoCapitalize="characters"
                outlineColor={errors.symbol ? colors.loss : colors.border}
                activeOutlineColor={errors.symbol ? colors.loss : colors.black}
                textColor={colors.black}
                style={styles.input}
                outlineStyle={styles.inputOutline}
              />
              {errors.symbol ? (
                <Text style={styles.errorText}>{errors.symbol}</Text>
              ) : null}
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>NAME *</Text>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                mode="outlined"
                placeholder={getPlaceholderName()}
                outlineColor={errors.name ? colors.loss : colors.border}
                activeOutlineColor={errors.name ? colors.loss : colors.black}
                textColor={colors.black}
                style={styles.input}
                outlineStyle={styles.inputOutline}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Quantity and Price Row */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>QUANTITY *</Text>
                <TextInput
                  value={quantity}
                  onChangeText={(text) => {
                    setQuantity(text);
                    if (errors.quantity) setErrors({ ...errors, quantity: '' });
                  }}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  outlineColor={errors.quantity ? colors.loss : colors.border}
                  activeOutlineColor={errors.quantity ? colors.loss : colors.black}
                  textColor={colors.black}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                />
                {errors.quantity ? (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                ) : null}
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>PURCHASE PRICE (USD) *</Text>
                <TextInput
                  value={purchasePrice}
                  onChangeText={(text) => {
                    setPurchasePrice(text);
                    if (errors.purchasePrice) setErrors({ ...errors, purchasePrice: '' });
                  }}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  outlineColor={errors.purchasePrice ? colors.loss : colors.border}
                  activeOutlineColor={errors.purchasePrice ? colors.loss : colors.black}
                  textColor={colors.black}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Affix text="$" />}
                />
                {errors.purchasePrice ? (
                  <Text style={styles.errorText}>{errors.purchasePrice}</Text>
                ) : null}
              </View>
            </View>

            {/* Purchase Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PURCHASE DATE</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconButton
                  icon="calendar-outline"
                  iconColor={colors.textSecondary}
                  size={20}
                  style={styles.dateIcon}
                />
                <Text style={styles.dateText}>
                  {purchaseDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <IconButton
                  icon="chevron-down"
                  iconColor={colors.textSecondary}
                  size={20}
                  style={styles.dateIcon}
                />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={purchaseDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setPurchaseDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Summary Card */}
          {totalInvestment > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>INVESTMENT SUMMARY</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>QUANTITY</Text>
                    <Text style={styles.summaryValue}>{parseFloat(quantity).toFixed(8)}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>PRICE PER UNIT</Text>
                    <Text style={styles.summaryValue}>
                      ${parseFloat(purchasePrice).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.totalInvestmentContainer}>
                  <Text style={styles.totalLabel}>TOTAL INVESTMENT</Text>
                  <Text style={styles.totalValue}>
                    ${totalInvestment.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <IconButton
                    icon="plus-circle"
                    iconColor={colors.white}
                    size={20}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.submitButtonText}>ADD TO PORTFOLIO</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    margin: 0,
  },
  greeting: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: -0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summarySection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1.5,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  typeCardActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  typeIcon: {
    margin: 0,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  typeLabelActive: {
    color: colors.white,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.loss,
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  dateIcon: {
    margin: 0,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  summaryLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: -0.5,
  },
  totalInvestmentContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -2,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    margin: 0,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bottomSpacer: {
    height: 32,
  },
});
