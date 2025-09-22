export type AssetType = 'STOCK' | 'CRYPTO' | 'ETF' | 'BOND' | 'OTHER';

export interface Asset {
  id: string;
  user_id: string;
  type: AssetType;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  // Optional fields for calculated values
  current_price?: number;
  current_value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
}

export interface CreateAssetRequest {
  type: AssetType;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date?: string;
}

export interface AssetsResponse {
  assets: Asset[];
}

export interface AssetResponse {
  asset: Asset;
  message?: string;
}