import type {
  PriceSimulationRequest,
  PriceSimulationResponse,
} from '@/types/priceSimulation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const snakeCasePayload = (
  payload: PriceSimulationRequest,
): Record<string, unknown> => ({
  product_name: payload.productName,
  unit_cost_per_kg: payload.unitCostPerKg,
  target_margin_rate: payload.targetMarginRate,
  quantity_kg: payload.quantityKg ?? null,
});

export const fetchPriceSimulation = async (
  payload: PriceSimulationRequest,
): Promise<PriceSimulationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/price-simulations/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snakeCasePayload(payload)),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message ?? '価格シミュレーションAPIの呼び出しに失敗しました';
    throw new Error(message);
  }

  const data = (await response.json()) as PriceSimulationResponse;
  return data;
};

export interface SaveSimulationRequest {
  productName: string;
  inputCostPerKg: number;
  targetMarginRate: number;
  calculatedPricePerKg: number;
  selectedPricePerKg?: number;
  quantityKg?: number;
  grossProfitTotal?: number;
  notes?: string;
}

export const saveSimulation = async (
  payload: SaveSimulationRequest
): Promise<{ id: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/price-simulations/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_name: payload.productName,
      input_cost_per_kg: payload.inputCostPerKg,
      target_margin_rate: payload.targetMarginRate,
      calculated_price_per_kg: payload.calculatedPricePerKg,
      selected_price_per_kg: payload.selectedPricePerKg,
      quantity_kg: payload.quantityKg,
      gross_profit_total: payload.grossProfitTotal,
      notes: payload.notes,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message ?? '保存に失敗しました';
    throw new Error(message);
  }

  return response.json();
};
