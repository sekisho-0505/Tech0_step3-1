'use client';

import { useEffect, useState } from 'react';
import { fetchBreakEvenCurrent } from '@/services/breakEvenService';
import type { BreakEvenResponse } from '@/types/breakEven';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<BreakEvenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchBreakEvenCurrent();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'データの読み込みに失敗しました',
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const statusColors = {
    safe: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  const statusText = {
    safe: '安全',
    warning: '注意',
    danger: '危険',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
          >
            ダッシュボード
          </Link>
          <Link
            href="/import"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 border border-gray-300"
          >
            インポート
          </Link>
        </nav>

        {/* KPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 今月の売上 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              今月の売上
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {(data.currentRevenue / 1000).toLocaleString()}
              <span className="text-base font-normal text-gray-500 ml-2">
                千円
              </span>
            </p>
          </div>

          {/* 損益分岐点 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              損益分岐点
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {(data.breakEvenRevenue / 1000).toLocaleString()}
              <span className="text-base font-normal text-gray-500 ml-2">
                千円
              </span>
            </p>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    data.status === 'safe'
                      ? 'bg-green-500'
                      : data.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(data.achievementRate * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                達成率: {(data.achievementRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* 粗利率 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">粗利率</h3>
            <p className="text-3xl font-bold text-gray-900">
              {(data.grossMarginRate * 100).toFixed(1)}
              <span className="text-base font-normal text-gray-500 ml-2">
                %
              </span>
            </p>
            <div
              className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[data.status]}`}
            >
              {statusText[data.status]}
            </div>
          </div>

          {/* 変動費率 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              変動費率
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {(data.variableCostRate * 100).toFixed(1)}
              <span className="text-base font-normal text-gray-500 ml-2">
                %
              </span>
            </p>
          </div>
        </div>

        {/* トレンドグラフ（簡易版） */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            月次トレンド
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    月
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    売上高
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    損益分岐点
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    達成状況
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.trend.map((item) => {
                  const achievement = (item.revenue / item.breakEven) * 100;
                  const isAchieved = achievement >= 100;
                  return (
                    <tr key={item.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item.revenue / 1000).toLocaleString()} 千円
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item.breakEven / 1000).toLocaleString()} 千円
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isAchieved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {achievement.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow p-6 flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="text-lg font-medium">価格シミュレーション</h3>
              <p className="text-sm text-blue-100 mt-1">
                新しい価格を計算する
              </p>
            </div>
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </Link>

          <Link
            href="/import"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow p-6 flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="text-lg font-medium">Excelインポート</h3>
              <p className="text-sm text-green-100 mt-1">
                データをアップロードする
              </p>
            </div>
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
