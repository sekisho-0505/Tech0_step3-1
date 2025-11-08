# AI実装ガイド - 価格設定支援システム

## 概要
このドキュメントは、要件定義書v2.0に基づいてAI（ChatGPT、Claude等）にシステムを実装させるための具体的な指示集です。

---

## 1. AI向けシステム実装プロンプト

### 1.1 初期セットアップ用プロンプト

```markdown
以下の要件定義書に基づいて、価格設定支援システムを実装してください。

【技術要件】
- Frontend: Next.js 14 + TypeScript + MUI 5
- Backend: FastAPI + Python 3.11
- Database: Supabase (PostgreSQL)
- 認証: Supabase Auth

【ステップ1: プロジェクト初期化】
以下のディレクトリ構造でプロジェクトを作成してください：

project-root/
├── frontend/          # Next.js
├── backend/           # FastAPI  
├── database/          # マイグレーション
└── docker-compose.yml # ローカル開発

各ディレクトリに必要な設定ファイル（package.json、requirements.txt等）を生成してください。

【必須要件】
1. 金額は内部で「円」、単価は「円/kg」で扱う
2. 最低売価を下回る価格は保存禁止（UIでガード）
3. Excel取込時は千円→円の変換を必ず実行
4. すべての計算で四捨五入（0.5以上切り上げ）を適用
```

### 1.2 価格計算API実装用プロンプト

```markdown
FastAPIで価格シミュレーションAPIを実装してください。

【仕様】
POST /api/price-simulations/calculate

【入力】
- product_name: 商品名（文字列、必須）
- unit_cost_per_kg: 原価（円/kg、必須、0より大）
- target_margin_rate: 目標粗利率（0.0〜0.9、必須）
- quantity_kg: 数量（kg、任意、0以上）

【計算式】
推奨価格 = unit_cost_per_kg / (1 - target_margin_rate)
粗利益 = 推奨価格 - unit_cost_per_kg

【出力】
- recommended_price_per_kg: 推奨価格（整数、四捨五入）
- gross_profit_per_kg: 粗利益（整数、四捨五入）
- margin_rate: 粗利率（小数4桁）
- price_patterns: 5パターン（10%,15%,20%,25%,30%）
- guard: 最低価格ガード情報

【エラーハンドリング】
- target_margin_rate >= 1.0 → エラー
- unit_cost_per_kg <= 0 → エラー
- エラー形式: {"error": {"code": "...", "message": "..."}}

Pydanticでバリデーション、Decimalで精度保証してください。
```

### 1.3 フロントエンド画面実装用プロンプト

```markdown
Next.js + MUIで価格シミュレーション画面を実装してください。

【画面仕様】
- 左右2カラムレイアウト
- 左：入力フォーム、右：計算結果表示

【入力フィールド】
1. 商品名（オートコンプリート）
2. 原価（数値入力、円/kg）
3. 目標粗利率（スライダー、0-90%）
4. 数量（数値入力、kg、任意）

【結果表示】
- 推奨価格を大きく表示（プライマリカラー）
- 価格パターンをテーブル表示
- 最低価格未満は赤色警告＋保存ボタン無効化

【状態管理】
- Zustandで実装
- ローディング状態を管理
- エラーはトースト通知

【バリデーション】
- Zodでスキーマ定義
- リアルタイムバリデーション
- エラーメッセージは日本語表示
```

---

## 2. 段階的実装手順

### Phase 1: 基盤構築（1週目）

```markdown
【Day 1-2: 環境構築】
1. リポジトリ作成
2. Docker環境構築
3. Supabaseプロジェクト作成
4. 環境変数設定

【Day 3-4: データベース】
1. マイグレーションファイル作成
2. 初期データ投入
3. RLS設定

【Day 5-7: API基盤】
1. FastAPIプロジェクト構造
2. 基本的なCRUD API
3. エラーハンドリング
4. ロギング設定
```

### Phase 2: コア機能実装（2週目）

```markdown
【Day 8-10: 価格計算機能】
1. 価格計算API実装
2. フロントエンド画面作成
3. API連携
4. バリデーション実装

【Day 11-12: 損益分岐点】
1. 分岐点計算API
2. ダッシュボード画面
3. グラフ表示（Chart.js）

【Day 13-14: Excel取込】
1. ファイルアップロードAPI
2. Excel解析処理
3. インポート画面
4. エラーハンドリング
```

### Phase 3: 品質向上（3週目）

```markdown
【Day 15-17: テスト】
1. 単体テスト作成
2. 統合テスト実装
3. E2Eテスト（Playwright）

【Day 18-19: UI/UX改善】
1. レスポンシブ対応
2. アクセシビリティ
3. パフォーマンス最適化

【Day 20-21: デプロイ】
1. CI/CDパイプライン
2. 本番環境構築
3. 監視設定
```

---

## 3. コード品質チェックリスト

### バックエンド

```python
# 必須実装項目
class QualityChecklistBackend:
    """
    □ Pydanticモデルですべての入出力を型定義
    □ SQLAlchemyモデルでDB操作を抽象化
    □ サービス層でビジネスロジックを分離
    □ 依存性注入でテスタビリティ確保
    □ asyncioで非同期処理
    □ ロギングをstructured loggingで実装
    □ エラーは統一フォーマットで返却
    □ Decimalで金額計算の精度保証
    □ トランザクション管理を適切に実装
    □ N+1問題を回避するクエリ最適化
    """
```

### フロントエンド

```typescript
// 必須実装項目
interface QualityChecklistFrontend {
  // □ TypeScriptで完全型付け（anyの使用禁止）
  // □ エラーバウンダリの実装
  // □ ローディング状態の管理
  // □ デバウンス処理の実装（入力フィールド）
  // □ メモ化による再レンダリング最適化
  // □ アクセシビリティ対応（ARIA属性）
  // □ レスポンシブデザイン
  // □ 国際化対応の準備（i18n）
  // □ Storybookでコンポーネントカタログ
  // □ テストIDの付与（data-testid）
}
```

---

## 4. トラブルシューティング用プロンプト

### 4.1 エラー解決

```markdown
以下のエラーが発生しています。解決方法を教えてください。

【エラー内容】
{エラーメッセージをここに貼り付け}

【発生箇所】
- ファイル: {ファイルパス}
- 行番号: {行番号}
- 実行した操作: {何をしたか}

【試したこと】
1. {試した解決策1}
2. {試した解決策2}

【環境情報】
- OS: {OS名とバージョン}
- Node.js: {バージョン}
- Python: {バージョン}
```

### 4.2 パフォーマンス改善

```markdown
価格計算APIのレスポンスが遅いです。改善してください。

【現状】
- 平均レスポンス時間: 500ms
- 同時リクエスト数: 10

【目標】
- レスポンス時間: 100ms以下
- 同時リクエスト: 100

【考慮事項】
- キャッシュ戦略
- データベースクエリ最適化
- 非同期処理の活用
```

---

## 5. AIへの注意事項

### 5.1 絶対に守るべきルール

```markdown
【金額計算】
❌ 浮動小数点演算（float）
✅ Decimal型使用

【丸め処理】
❌ Math.floor() や int()
✅ 四捨五入（ROUND_HALF_UP）

【単位】
❌ 表示と内部で単位混在
✅ 内部は円、表示のみ千円

【最低価格】
❌ バックエンドのみでチェック
✅ フロントエンドでもガード

【エラー処理】
❌ console.log()で済ます
✅ 構造化ログ＋ユーザー通知

【型定義】
❌ any型の使用
✅ 厳密な型定義

【テスト】
❌ 正常系のみ
✅ 異常系・境界値も網羅
```

### 5.2 推奨プラクティス

```markdown
【命名規則】
- API: snake_case
- TypeScript: camelCase
- コンポーネント: PascalCase
- 定数: UPPER_SNAKE_CASE

【コミット】
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト
- chore: その他

【コメント】
- なぜ（Why）を説明
- 複雑なビジネスロジックは必須
- TODOには期限を記載

【セキュリティ】
- 環境変数で機密情報管理
- SQLインジェクション対策
- XSS対策
- CORS適切に設定
```

---

## 6. 実装確認用コマンド集

### 6.1 開発環境起動

```bash
# 全サービス起動
docker-compose up

# フロントエンドのみ
cd frontend && npm run dev

# バックエンドのみ
cd backend && uvicorn app.main:app --reload --port 8000

# データベース確認
docker exec -it pdss-db psql -U postgres -d pdss
```

### 6.2 テスト実行

```bash
# バックエンドテスト
cd backend && pytest -v --cov=app

# フロントエンドテスト
cd frontend && npm test

# E2Eテスト
cd frontend && npm run test:e2e

# 負荷テスト
artillery run load-test.yml
```

### 6.3 ビルド・デプロイ

```bash
# フロントエンドビルド
cd frontend && npm run build

# Dockerイメージ作成
docker build -t pdss-api ./backend
docker build -t pdss-web ./frontend

# デプロイ（Vercel）
vercel --prod

# デプロイ（Railway）
railway up
```

---

## 7. 実装完了チェックリスト

### MVP機能

```markdown
## 価格シミュレーション
□ 原価入力 → 推奨価格算出
□ 5パターンの価格提示
□ 最低価格ガード（UI）
□ 計算履歴の保存
□ バリデーションエラー表示

## 損益分岐点
□ 月次固定費の登録
□ リアルタイム分岐点計算
□ 進捗率の可視化
□ 危険度の色分け表示
□ トレンドグラフ

## Excel取込
□ ファイルアップロード
□ 列マッピング設定
□ 千円→円の自動変換
□ エラー/警告の表示
□ インポート履歴

## 共通機能
□ ログイン認証
□ レスポンシブ対応
□ エラーハンドリング
□ ローディング表示
□ 日本語メッセージ
```

### 品質基準

```markdown
## パフォーマンス
□ API応答 < 100ms（価格計算）
□ 画面遷移 < 2秒
□ FCP < 1.8秒
□ エラー率 < 0.1%

## コード品質
□ テストカバレッジ > 80%
□ ESLint警告ゼロ
□ TypeScriptエラーゼロ
□ 循環的複雑度 < 10

## セキュリティ
□ HTTPS必須
□ 認証実装
□ SQLインジェクション対策
□ XSS対策
□ CORS設定
```

---

## 8. サンプル実装コード

### 8.1 価格計算サービス（完全版）

```python
# backend/app/services/price_calculation.py
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional
from pydantic import BaseModel, Field, validator

class PriceCalculationInput(BaseModel):
    """価格計算入力モデル"""
    product_name: str = Field(..., min_length=1, max_length=200)
    unit_cost_per_kg: Decimal = Field(..., gt=0, le=999999999.999)
    target_margin_rate: Decimal = Field(..., ge=0, lt=0.9)
    quantity_kg: Optional[Decimal] = Field(None, ge=0)
    
    @validator('unit_cost_per_kg', 'target_margin_rate', 'quantity_kg', pre=True)
    def convert_to_decimal(cls, v):
        if v is not None:
            return Decimal(str(v))
        return v

class PricePattern(BaseModel):
    """価格パターン"""
    margin_rate: Decimal
    price_per_kg: int
    profit_per_kg: int

class PriceCalculationResult(BaseModel):
    """価格計算結果"""
    recommended_price_per_kg: int
    gross_profit_per_kg: int
    gross_profit_total: Optional[int]
    margin_rate: Decimal
    price_patterns: List[PricePattern]
    guard: dict

class PriceCalculationService:
    """価格計算サービス"""
    
    @staticmethod
    def round_jpy(value: Decimal) -> int:
        """円単位で四捨五入"""
        return int(value.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    
    def calculate(self, input_data: PriceCalculationInput) -> PriceCalculationResult:
        """価格を計算"""
        # 推奨価格計算
        recommended = input_data.unit_cost_per_kg / (Decimal('1') - input_data.target_margin_rate)
        gross_profit = recommended - input_data.unit_cost_per_kg
        
        # パターン生成
        patterns = []
        for margin in [Decimal('0.10'), Decimal('0.15'), Decimal('0.20'), 
                      Decimal('0.25'), Decimal('0.30')]:
            price = input_data.unit_cost_per_kg / (Decimal('1') - margin)
            profit = price - input_data.unit_cost_per_kg
            patterns.append(PricePattern(
                margin_rate=margin,
                price_per_kg=self.round_jpy(price),
                profit_per_kg=self.round_jpy(profit)
            ))
        
        # 総粗利益計算
        gross_profit_total = None
        if input_data.quantity_kg:
            gross_profit_total = self.round_jpy(gross_profit * input_data.quantity_kg)
        
        # 最低価格ガード
        min_allowed = recommended
        
        return PriceCalculationResult(
            recommended_price_per_kg=self.round_jpy(recommended),
            gross_profit_per_kg=self.round_jpy(gross_profit),
            gross_profit_total=gross_profit_total,
            margin_rate=input_data.target_margin_rate,
            price_patterns=patterns,
            guard={
                "min_allowed_price_per_kg": self.round_jpy(min_allowed),
                "is_below_min": False,
                "warning_message": None
            }
        )
```

### 8.2 フロントエンドコンポーネント（完全版）

```tsx
// frontend/src/components/PriceSimulation.tsx
import React, { useState } from 'react';
import {
  Box, Grid, Card, TextField, Slider,
  Button, Alert, Typography, Table,
  TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Chip
} from '@mui/material';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePriceCalculation } from '@/hooks/usePriceCalculation';

// バリデーションスキーマ
const schema = z.object({
  productName: z.string().min(1, '商品名は必須です'),
  unitCostPerKg: z.number().positive('原価は0より大きい値を入力してください'),
  targetMarginRate: z.number().min(0).max(90),
  quantityKg: z.number().nonnegative().optional()
});

type FormData = z.infer<typeof schema>;

export const PriceSimulation: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const { calculate, loading, error } = usePriceCalculation();
  
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productName: '',
      unitCostPerKg: 0,
      targetMarginRate: 20,
      quantityKg: undefined
    }
  });

  const onSubmit = async (data: FormData) => {
    const result = await calculate({
      product_name: data.productName,
      unit_cost_per_kg: data.unitCostPerKg,
      target_margin_rate: data.targetMarginRate / 100,
      quantity_kg: data.quantityKg
    });
    setResult(result);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            シミュレーション条件
          </Typography>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Controller
                name="productName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="商品名"
                    fullWidth
                    required
                    error={!!errors.productName}
                    helperText={errors.productName?.message}
                  />
                )}
              />
              
              <Controller
                name="unitCostPerKg"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="仕入原価（円/kg）"
                    fullWidth
                    required
                    error={!!errors.unitCostPerKg}
                    helperText={errors.unitCostPerKg?.message || '千円/kgの場合は1000倍して入力'}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              
              <Box>
                <Typography gutterBottom>
                  目標粗利率: {control._formValues.targetMarginRate}%
                </Typography>
                <Controller
                  name="targetMarginRate"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      {...field}
                      min={0}
                      max={90}
                      step={1}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 30, label: '30%' },
                        { value: 60, label: '60%' },
                        { value: 90, label: '90%' }
                      ]}
                    />
                  )}
                />
              </Box>
              
              <Controller
                name="quantityKg"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="販売予定量（kg）"
                    fullWidth
                    helperText="任意項目"
                    onChange={(e) => field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )}
                  />
                )}
              />
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '計算実行'}
              </Button>
            </Box>
          </form>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        {result && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              シミュレーション結果
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity={result.guard.is_below_min ? 'error' : 'success'}
                sx={{ mb: 2 }}
              >
                {result.guard.is_below_min 
                  ? '最低売価を下回っています'
                  : '適正価格です'
                }
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`推奨価格: ${result.recommended_price_per_kg.toLocaleString()}円/kg`}
                  color="primary"
                  sx={{ fontSize: '1.2rem', py: 3 }}
                />
                <Chip 
                  label={`粗利益: ${result.gross_profit_per_kg.toLocaleString()}円/kg`}
                  color="default"
                />
                <Chip 
                  label={`粗利率: ${(result.margin_rate * 100).toFixed(1)}%`}
                  color="default"
                />
              </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              価格パターン
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>粗利率</TableCell>
                  <TableCell align="right">販売価格</TableCell>
                  <TableCell align="right">粗利益</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.price_patterns.map((pattern: any) => (
                  <TableRow 
                    key={pattern.margin_rate}
                    selected={pattern.margin_rate === result.margin_rate}
                  >
                    <TableCell>{(pattern.margin_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell align="right">
                      {pattern.price_per_kg.toLocaleString()}円
                    </TableCell>
                    <TableCell align="right">
                      {pattern.profit_per_kg.toLocaleString()}円
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {result.guard.is_below_min && (
              <Button
                variant="contained"
                color="error"
                fullWidth
                disabled
                sx={{ mt: 2 }}
              >
                最低価格を下回るため保存できません
              </Button>
            )}
          </Card>
        )}
      </Grid>
    </Grid>
  );
};
```

---

このAI実装ガイドと要件定義書v2.0を組み合わせることで、AIに対して明確で具体的な実装指示を与えることができます。
