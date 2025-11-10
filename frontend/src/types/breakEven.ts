/**
 * 損益分岐点関連の型定義
 */

export interface TrendData {
  month: string;
  revenue: number;
  breakEven: number;
}

export interface BreakEvenResponse {
  yearMonth: string;
  fixedCosts: number;
  currentRevenue: number;
  variableCostRate: number;
  grossMarginRate: number;
  breakEvenRevenue: number;
  achievementRate: number;
  deltaRevenue: number;
  status: 'safe' | 'warning' | 'danger';
  trend: TrendData[];
}
