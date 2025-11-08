# 価格設定支援システム

本リポジトリは「AI実装ガイド.md」「価格設定支援システム_要件定義書_v2.0.md」をもとに構築された学習用プロジェクトです。Next.js + MUI フロントエンドと FastAPI バックエンド、Supabase(PostgreSQL) を想定した構成になっています。初学者の方向けに、ローカル開発を始めるための手順をまとめました。

## ディレクトリ構成

```
project-root/
├── frontend/        # Next.js 14 + TypeScript + MUI 5
├── backend/         # FastAPI 価格シミュレーション API
├── database/        # Supabase/PostgreSQL 用マイグレーション
└── docker-compose.yml
```

## 事前準備

- Node.js 20 系
- npm 10 以上
- Python 3.11
- (任意) Docker Desktop または Docker Engine 20 以上

> Docker を利用すると、依存関係を個別にインストールする必要がありません。未経験の場合は Docker 手順を推奨します。

## セットアップ手順（Docker 利用）

1. リポジトリ直下でコンテナを起動します。
   ```bash
   docker compose up -d --build
   ```
2. 起動後のアクセス先
   - フロントエンド: http://localhost:3000
   - バックエンド: http://localhost:8000/docs (Swagger UI)
   - PostgreSQL: localhost:5432 / DB名 `pricing`

3. 停止する場合は以下を実行します。
   ```bash
   docker compose down
   ```

## セットアップ手順（ローカル実行）

### 1. バックエンド

```bash
cd backend
python -m venv .venv
source .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. フロントエンド

別ターミナルを開きます。

```bash
cd frontend
npm install
npm run dev -- --port 3000
```

ブラウザで http://localhost:3000 を開くと価格シミュレーション画面が表示されます。フォームに原価・粗利率などを入力し、「計算を実行」を押すとバックエンド API にリクエストが送られます。

## 環境変数

| 変数名 | 用途 | 設定例 |
| ------ | ---- | ------ |
| `NEXT_PUBLIC_API_BASE_URL` | フロントエンドから参照する API の URL | `http://localhost:8000` |
| `DATABASE_URL` (将来拡張) | FastAPI が接続する Supabase/PostgreSQL | `postgresql://postgres:postgres@localhost:5432/pricing` |

Docker 起動時は `NEXT_PUBLIC_API_BASE_URL` が自動で設定されます。ローカルで環境変数を指定したい場合は `frontend/.env.local` を作成し、上記の値を記入してください。

## データベース

`database/migrations/001_initial_schema.sql` に要件定義書ベースの初期スキーマを用意しています。Supabase SQL エディタまたは `psql` で適用してください。

```bash
psql postgresql://postgres:postgres@localhost:5432/pricing -f database/migrations/001_initial_schema.sql
```

## 機能概要

- **バックエンド API**: `/api/price-simulations/calculate`
  - 原価（円/kg）、目標粗利率（0〜90%）、任意の数量(kg)を入力として受け取り、推奨単価・粗利益・5種類の価格パターンを返します。
  - 単位はすべて円／円/kgで統一し、四捨五入で整数化しています。
  - 最低売価（原価 + 5% マージン）を下回る場合はガードフラグと日本語メッセージを返します。
- **フロントエンド UI**: 左カラムで入力、右カラムで結果表示。Zustand で結果状態とローディングを管理し、Zod + React Hook Form によるリアルタイムバリデーションを実装しています。

## よくある質問

- **API がエラーになる**: 粗利率が 90% を超えていないか確認してください。0〜90% の範囲で指定します。
- **表示が更新されない**: ブラウザの開発者ツールからネットワークエラーが出ていないか確認し、バックエンドが起動中かチェックしてください。
- **データベースに接続したい**: Supabase のプロジェクトを作成し、`.env` に `DATABASE_URL` 等を設定すると FastAPI から接続できるようになります。

## 今後の拡張ポイント

- Supabase Auth を利用したユーザー認証の追加
- Excel 取込機能および千円→円の自動変換
- 価格シミュレーション結果の永続化と履歴画面

学習用途の最初の一歩としてご活用ください。
