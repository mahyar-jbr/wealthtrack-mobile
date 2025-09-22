import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  SegmentedButtons, 
  Card,
  HelperText,
  ActivityIndicator,
  Appbar
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { assetService } from '../services/assets';
import { AssetType } from '../types/asset';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from "@react-native-community/datetimepicker";

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

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add New Asset" />
      </Appbar.Header>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Asset Type
              </Text>
              <SegmentedButtons
                value={assetType}
                onValueChange={(value) => setAssetType(value as AssetType)}
                buttons={[
                  { value: 'STOCK', label: 'Stock' },
                  { value: 'CRYPTO', label: 'Crypto' },
                  { value: 'ETF', label: 'ETF' },
                ]}
                style={styles.segmentedButtons}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Asset Details
              </Text>

              <TextInput
                label="Symbol"
                value={symbol}
                onChangeText={setSymbol}
                mode="outlined"
                placeholder={getPlaceholderSymbol()}
                autoCapitalize="characters"
                error={!!errors.symbol}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.symbol}>
                {errors.symbol}
              </HelperText>

              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                placeholder={getPlaceholderName()}
                error={!!errors.name}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Quantity"
                    value={quantity}
                    onChangeText={setQuantity}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    error={!!errors.quantity}
                  />
                  <HelperText type="error" visible={!!errors.quantity}>
                    {errors.quantity}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <TextInput
                    label="Purchase Price ($)"
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    error={!!errors.purchasePrice}
                  />
                  <HelperText type="error" visible={!!errors.purchasePrice}>
                    {errors.purchasePrice}
                  </HelperText>
                </View>
              </View>

              <View style={styles.dateContainer}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  Purchase Date
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  {purchaseDate.toLocaleDateString()}
                </Button>
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
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Summary
              </Text>
              {quantity && purchasePrice && (
                <>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Total Investment:</Text>
                    <Text variant="bodyLarge" style={styles.summaryValue}>
                      ${(parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Average Price:</Text>
                    <Text variant="bodyLarge" style={styles.summaryValue}>
                      ${parseFloat(purchasePrice).toFixed(2)}
                    </Text>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Add Asset
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              disabled={loading}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateContainer: {
    marginTop: 16,
  },
  dateLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  dateButton: {
    justifyContent: 'center',
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});