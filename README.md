# PortfolioAI

個人の資産運用 Excel データをアップロードして、ダッシュボードで可視化する Next.js アプリ。

**デモデザイン**: `design-mockup.html` をブラウザで開いて確認できます。

---

## セットアップ

### 必要環境

- Node.js 20+
- pnpm（推奨）または npm
- Vercel アカウント（DB・Blob・デプロイ用）

### ローカル起動

```bash
# リポジトリをクローン
git clone https://github.com/yourname/portfolio-ai.git
cd portfolio-ai

# 依存インストール
pnpm install

# 環境変数を設定（.env.local を作成）
cp .env.example .env.local
# → POSTGRES_URL, BLOB_READ_WRITE_TOKEN を記入

# DB マイグレーション
pnpm db:migrate

# 開発サーバー起動
pnpm dev
# → http://localhost:3000
```

### 環境変数

```env
# Vercel Postgres
POSTGRES_URL=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

---

## 使い方

1. `/upload` を開く
2. `資産運用(YYMMDD).xlsx` をドロップ
3. 取込オプション・シートマッピングを確認して「取込開始」
4. 完了後、ダッシュボードへ自動遷移

---

## デプロイ（Vercel）

```bash
# Vercel CLI でデプロイ
vercel --prod
```

Vercel ダッシュボードで以下を有効化:
- **Storage → Postgres** — DB 作成後、環境変数を自動連携
- **Storage → Blob** — ファイルストレージ

---

## プロジェクト構成

```
app/                  # Next.js App Router
  page.tsx            # ダッシュボード
  upload/page.tsx     # アップロード画面
  api/upload/         # Excel 受信 API
components/           # UI コンポーネント
lib/excel/            # Excel 解析ロジック
lib/db/               # DB クエリ
types/                # TypeScript 型定義
design-mockup.html    # デザインリファレンス（静的HTML）
CLAUDE.md             # Claude Code 向け規約・コンテキスト
requirements.md       # 機能要件・データモデル
```

詳細は `CLAUDE.md`（Claude Code 向け）と `requirements.md`（要件）を参照。

---

## 技術スタック

Next.js 14 / TypeScript / Tailwind CSS / shadcn/ui / Recharts / SheetJS / Vercel Postgres / Vercel Blob

---

## ライセンス

Private — 個人利用のみ
