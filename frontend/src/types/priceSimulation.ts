export interface PriceSimulationRequest {
  productName: string;
  unitCostPerKg: number;
  targetMarginRate: number;
  quantityKg?: number;
}

export interface PricePattern {
  margin_rate: number;
  price_per_kg: number;
  profit_per_kg: number;
}

export interface GuardInfo {
  minimum_price_per_kg: number;
  is_below_min: boolean;
  message: string;
}

export interface PriceSimulationResponse {
  recommended_price_per_kg: number;
  gross_profit_per_kg: number;
  margin_rate: number;
  price_patterns: PricePattern[];
  guard: GuardInfo;
}
