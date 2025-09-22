import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { tokenStorage } from './auth';
import { Asset, CreateAssetRequest, AssetsResponse, AssetResponse } from '../types/asset';

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

export const assetService = {
  // Get all user's assets
  async getAssets(): Promise<Asset[]> {
    try {
      const response = await api.get<AssetsResponse>(API_ENDPOINTS.ASSETS.BASE);
      return response.data.assets;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch assets');
    }
  },

  // Get single asset by ID
  async getAsset(id: string): Promise<Asset> {
    try {
      const response = await api.get<AssetResponse>(API_ENDPOINTS.ASSETS.BY_ID(id));
      return response.data.asset;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch asset');
    }
  },

  // Create new asset
  async createAsset(data: CreateAssetRequest): Promise<Asset> {
    try {
      const response = await api.post<AssetResponse>(API_ENDPOINTS.ASSETS.BASE, data);
      return response.data.asset;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create asset');
    }
  },

  // Delete asset
  async deleteAsset(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ASSETS.BY_ID(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete asset');
    }
  },
};