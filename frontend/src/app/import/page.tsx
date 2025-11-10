'use client';

import { useState } from 'react';
import { importExcel } from '@/services/importService';
import type { ImportResponse } from '@/types/import';
import Link from 'next/link';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const importResult = await importExcel(file);
      setResult(importResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'インポートに失敗しました',
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            データインポート
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <nav className="mb-8 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 border border-gray-300"
          >
            価格シミュレーション
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 border border-gray-300"
          >
            ダッシュボード
          </Link>
          <Link
            href="/import"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
          >
            インポート
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Excelファイルアップロード
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ファイル選択
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              <p className="mt-2 text-sm text-gray-500">
                対応形式: .xlsx, .xls (最大10MB)
              </p>
            </div>

            {file && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  選択されたファイル:{' '}
                  <span className="font-medium">{file.name}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  サイズ: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'インポート中...' : 'インポート開始'}
            </button>
          </form>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">エラー</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="space-y-6">
            {/* サマリー */}
            <div
              className={`rounded-lg p-6 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <div className="flex items-start">
                <svg
                  className={`w-6 h-6 mt-0.5 mr-3 ${
                    result.success ? 'text-green-600' : 'text-yellow-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-medium ${
                      result.success ? 'text-green-900' : 'text-yellow-900'
                    }`}
                  >
                    インポート
                    {result.success ? '完了' : '完了（一部エラー）'}
                  </h3>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">成功</p>
                      <p className="text-2xl font-bold text-green-600">
                        {result.imported}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">スキップ</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {result.skipped}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">エラー</p>
                      <p className="text-2xl font-bold text-red-600">
                        {result.errors.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* エラー詳細 */}
            {result.errors.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    エラー詳細
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          行
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          列
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          値
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          理由
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {err.row}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {err.column}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(err.value)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {err.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 警告 */}
            {result.warnings.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">警告</h3>
                </div>
                <div className="px-6 py-4">
                  <ul className="space-y-2">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-yellow-500 mt-0.5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">
                          行 {warning.row}: {warning.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
