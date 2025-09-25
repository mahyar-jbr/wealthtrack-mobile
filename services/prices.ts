import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { tokenStorage } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
  changePercent24h?: number;
  lastUpdated: string;
  source: 'coingecko' | 'yahoo' | 'manual';
}

export interface PortfolioValue {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  assets: AssetWithPrice[];
}

export interface AssetWithPrice {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  cost: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  lastPriceUpdate: string | null;
  priceSource: string;
}

export const priceService = {
  // Get single price
  async getPrice(symbol: string): Promise<PriceData> {
    try {
      const response = await api.get<PriceData>(`/api/prices/${symbol}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch price');
    }
  },

  // Get portfolio value with all prices
  async getPortfolioValue(): Promise<PortfolioValue> {
    try {
      const response = await api.get<PortfolioValue>('/api/prices/portfolio/value');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch portfolio value');
    }
  },

  // Get batch prices
  async getBatchPrices(symbols: string[]): Promise<Record<string, PriceData | null>> {
    try {
      const response = await api.post('/api/prices/batch', { symbols });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch prices');
    }
  },

  // Trigger price update for all assets
  async updateAllPrices(): Promise<void> {
    try {
      await api.post('/api/prices/update-all');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update prices');
    }
  },
};