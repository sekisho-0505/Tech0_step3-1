/**
 * インポート関連の型定義
 */

export interface ImportError {
  row: number;
  column: string;
  value: any;
  reason: string;
}

export interface ImportWarning {
  row: number;
  message: string;
}

export interface ImportResponse {
  success: boolean;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}
