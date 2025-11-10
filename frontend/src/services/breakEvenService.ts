const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BreakEvenData {
  year_month: string;
  fixed_costs: number;
  current_revenue: number;
  variable_cost_rate: number;
  gross_margin_rate: number;
  break_even_revenue: number;
  achievement_rate: number;
  delta_revenue: number;
  status: 'safe' | 'warning' | 'danger';
}

export async function fetchBreakEvenAnalysis(yearMonth?: string): Promise<BreakEvenData> {
  const url = yearMonth
    ? `${API_BASE_URL}/api/break-even/current?year_month=${yearMonth}`
    : `${API_BASE_URL}/api/break-even/current`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
