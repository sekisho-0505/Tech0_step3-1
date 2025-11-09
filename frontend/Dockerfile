# syntax=docker/dockerfile:1.6
#
# 【WSL2/Windows 環境での高速化 Tips】
# - WSL2 のディレクトリ上で作業（/home/<user>/...）を推奨。C:\ 配下は遅い
# - Windows Defender の除外設定に node_modules を追加すると大幅に高速化
# - BuildKit を有効化: $env:DOCKER_BUILDKIT=1 (PowerShell) or export DOCKER_BUILDKIT=1 (bash)
#

# ========================================
# Stage 1: 依存関係の解決
# ========================================
FROM node:18-alpine AS deps
WORKDIR /app

# 依存ファイルのみ先にコピー（package.json が変わらなければキャッシュヒット）
COPY package.json package-lock.json ./

# BuildKit キャッシュマウントを利用して npm キャッシュを永続化
# npm ci は lockfile 前提で高速・再現性が高い
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# ========================================
# Stage 2: ランタイム
# ========================================
FROM node:18-alpine AS runner
WORKDIR /app

# 依存関係を deps ステージからコピー
COPY --from=deps /app/node_modules ./node_modules

# アプリケーション本体をコピー（こちらが変わってもdepsはキャッシュヒット）
COPY . .

EXPOSE 3000

# 開発モードで起動
CMD ["npm", "run", "dev"]
