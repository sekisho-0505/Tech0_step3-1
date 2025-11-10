# 価格設定支援システム - セットアップガイド

## 概要

このシステムは、価格シミュレーション、損益分岐点分析、履歴管理を行うWebアプリケーションです。

## 技術スタック

**バックエンド:**
- FastAPI 0.110.x
- SQLAlchemy 2.0.x
- PostgreSQL
- Python 3.11.x

**フロントエンド:**
- Next.js 14.2.x
- TypeScript 5.3.x
- MUI 5.15.x
- Zustand 4.5.x

## セットアップ手順

### 1. バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成（Windowsの場合）
python -m venv .venv
.venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
copy .env.example .env
# .envファイルを編集してDATABASE_URLなどを設定

# データベースの作成（PostgreSQLが必要）
# CREATE DATABASE pdss;

# サーバーの起動
uvicorn app.main:app --reload
```

バックエンドAPIは `http://localhost:8000` で起動します。
API仕様は `http://localhost:8000/docs` で確認できます。

### 2. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
copy .env.example .env.local
# .env.localファイルを編集

# 開発サーバーの起動
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

### 3. データベースの初期化

データベーステーブルは、バックエンドサーバー起動時に自動的に作成されます（`Base.metadata.create_all(bind=engine)`）。

既存のSQLマイグレーションファイルを使用する場合:
```bash
cd database
psql -U your_user -d pdss -f migrations/001_initial_schema.sql
```

## 環境変数

### バックエンド (.env)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/pdss
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SECRET_KEY=your-secret-key
ENVIRONMENT=development
DEBUG=true
```

### フロントエンド (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 実装済み機能（P0/P1）

### P0機能
- ✅ SQLAlchemy統合とデータベースモデル
- ✅ 価格シミュレーション保存API
- ✅ 損益分岐点分析API
- ✅ シミュレーション履歴取得API
- ✅ ダッシュボード画面
- ✅ 認証機能の基本設定（Supabase Auth）

### P1機能
- ✅ ルーティング構造の整備
- ✅ 損益分岐点詳細画面
- ✅ シミュレーション履歴画面
- ✅ 価格シミュレーション保存機能

### 未実装機能（P2）
- ⏱ データインポート画面
- ⏱ 月次比較画面
- ⏱ インポート履歴画面
- ⏱ 設定画面

## 画面遷移

```
/ (ルート) → /dashboard (ダッシュボード)
├── /dashboard - KPI表示、損益分岐点サマリー
├── /price-simulation - 価格シミュレーション
├── /break-even - 損益分岐点詳細
├── /history/simulations - シミュレーション履歴
└── /import - データインポート（未実装）
```

## APIエンドポイント

### 価格シミュレーション
- `POST /api/price-simulations/calculate` - 価格計算
- `POST /api/price-simulations/save` - シミュレーション保存
- `GET /api/price-simulations/history` - 履歴取得

### 損益分岐点
- `GET /api/break-even/current` - 損益分岐点分析

### 商品
- `GET /api/products/list` - 商品リスト

## トラブルシューティング

### データベース接続エラー
1. PostgreSQLが起動しているか確認
2. DATABASE_URLが正しいか確認
3. データベース`pdss`が存在するか確認

### APIが呼び出せない
1. バックエンドサーバーが起動しているか確認（http://localhost:8000/health）
2. CORSエラーの場合、`backend/app/core/config.py`のCORS設定を確認

### フロントエンドでデータが表示されない
1. `.env.local`の`NEXT_PUBLIC_API_URL`が正しいか確認
2. ブラウザの開発者ツールでネットワークエラーを確認

## 次のステップ

1. Supabaseプロジェクトを作成し、認証を有効化
2. 本番環境用のデータベースをセットアップ
3. データインポート機能の実装
4. テストコードの作成
5. デプロイ設定（Vercel + Railway/Render）

## 参考資料

- [要件定義書](./価格設定支援システム_要件定義書_v2.0.md)
- [AI実装ガイド](./AI実装ガイド.md)
- FastAPI ドキュメント: https://fastapi.tiangolo.com/
- Next.js ドキュメント: https://nextjs.org/docs
- MUI ドキュメント: https://mui.com/
