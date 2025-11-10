import type { BreakEvenResponse } from '@/types/breakEven';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/**
 * 損益分岐点情報を取得
 * @param yearMonth オプション: YYYY-MM形式の年月。指定しない場合は現在月。
 * @returns 損益分岐点情報
 */
export const fetchBreakEvenCurrent = async (
  yearMonth?: string,
): Promise<BreakEvenResponse> => {
  const url = new URL(`${API_BASE_URL}/api/break-even/current`);
  if (yearMonth) {
    url.searchParams.append('year_month', yearMonth);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      errorBody?.error?.message ??
      '損益分岐点情報の取得に失敗しました';
    throw new Error(message);
  }

  const data = await response.json();

  // スネークケースからキャメルケースに変換
  return {
    yearMonth: data.year_month,
    fixedCosts: data.fixed_costs,
    currentRevenue: data.current_revenue,
    variableCostRate: data.variable_cost_rate,
    grossMarginRate: data.gross_margin_rate,
    breakEvenRevenue: data.break_even_revenue,
    achievementRate: data.achievement_rate,
    deltaRevenue: data.delta_revenue,
    status: data.status,
    trend: data.trend.map((item: any) => ({
      month: item.month,
      revenue: item.revenue,
      breakEven: item.break_even,
    })),
  };
};
