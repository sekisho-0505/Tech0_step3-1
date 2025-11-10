const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface SimulationHistory {
  id: string;
  product_name: string;
  simulation_at: string;
  input_cost_per_kg: number;
  target_margin_rate: number;
  calculated_price_per_kg: number;
  selected_price_per_kg: number | null;
  status: string;
}

export async function fetchSimulationHistory(
  limit: number = 50,
  offset: number = 0
): Promise<SimulationHistory[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/price-simulations/history?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
