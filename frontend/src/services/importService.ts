import type { ImportResponse } from '@/types/import';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/**
 * Excelファイルをインポート
 * @param file アップロードするExcelファイル
 * @returns インポート結果
 */
export const importExcel = async (file: File): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/import/excel`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      errorBody?.error?.message ?? 'ファイルのインポートに失敗しました';
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};
