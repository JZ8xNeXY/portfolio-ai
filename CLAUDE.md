# CLAUDE.md — PortfolioAI プロジェクト

Claude Code がこのリポジトリで作業する際の規約・コンテキストをまとめたファイルです。

---

## プロジェクト概要

個人資産運用の Excel データをアップロード → 自動解析 → ダッシュボード表示する Next.js アプリ。  
Vercel にデプロイ。ユーザーは日本語話者 1 名（個人利用）。

---

## 技術スタック

| レイヤー | 採用技術 |
|---|---|
| フレームワーク | Next.js 14（App Router） |
| 言語 | TypeScript |
| スタイリング | MUI (Material-UI) v5 |
| コンポーネント | @mui/material + @mui/icons-material |
| チャート | Recharts |
| Excel 解析 | xlsx（SheetJS） |
| DB / ストレージ | Vercel Postgres + Vercel Blob |
| 認証 | NextAuth.js（将来対応、初期は不要） |
| デプロイ | Vercel |

---

## ディレクトリ構成（目標）

```
portfolio-ai/
├── app/
│   ├── layout.tsx          # ルートレイアウト（Sidebar + Topbar）
│   ├── page.tsx            # ダッシュボード（/ ）
│   ├── upload/
│   │   └── page.tsx        # アップロード画面（/upload）
│   └── api/
│       └── upload/
│           └── route.ts    # POST: Excel 受信 → 解析 → DB 保存
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── dashboard/
│   │   ├── KpiCards.tsx
│   │   ├── TrendChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── StackedChart.tsx
│   │   ├── AllocBars.tsx
│   │   └── HoldingsTable.tsx
│   └── upload/
│       ├── Dropzone.tsx
│       ├── SheetMapper.tsx
│       └── UploadProgress.tsx
├── lib/
│   ├── excel/
│   │   ├── parser.ts       # SheetJS でシート別データ抽出
│   │   └── normalizer.ts   # 日付・金額の正規化
│   └── db/
│       └── queries.ts      # Vercel Postgres クエリ
├── types/
│   └── portfolio.ts        # 型定義
├── public/
├── CLAUDE.md               # このファイル
├── requirements.md
└── README.md
```

---

## Excel シート構造（入力データ仕様）

アップロードされる Excel は以下 8 シートを持つ（`資産運用(YYMMDD).xlsx`）。

| シート名 | 内容 | 優先度 |
|---|---|---|
| `資産月次推移` | 月次総資産・カテゴリ別残高（行=月、列=カテゴリ） | 最高 |
| `全資産割合` | 資産クラス別残高の時系列（行=銘柄、列=日付） | 高 |
| `資産運用状況` | 現在の保有銘柄一覧（評価額・含み益等） | 高 |
| `財務諸表` | BS形式の資産負債一覧 | 中 |
| `資産割合` | 投資配分（IDECO含む） | 中 |
| `資産状況` | 口座別残高の詳細 | 中 |
| `セクター割合` | VTI等のセクター比率推移 | 低 |
| `毎月積立額` | 積立設定額の履歴 | 低 |

### parser.ts が返すべき型（`types/portfolio.ts` 参照）

```ts
MonthlyTrend[]    // 資産月次推移
AssetAllocation[] // 全資産割合（スナップショット）
Holding[]         // 資産運用状況（現在保有）
```

---

## コーディング規約

- **関数コンポーネント + hooks** のみ使用。クラスコンポーネント不可。
- `use client` は最小限に。データフェッチは Server Component で行う。
- 型は `any` 禁止。Excel の生データのみ `unknown` 許容。
- ファイル名はコンポーネントが PascalCase、それ以外は camelCase。
- エラーは `console.error` でなく `throw new Error()` で上位に伝播。
- コメントは日本語可。

---

## API 仕様

### `POST /api/upload`

**Request**: `multipart/form-data`  
- `file`: xlsx ファイル（上限 50MB）
- `mode`: `"append"` | `"overwrite"`
- `baseDate`: `"YYYY-MM-DD"`

**Response** (成功):
```json
{
  "success": true,
  "sheetsProcessed": ["資産月次推移", "全資産割合", "資産運用状況"],
  "recordsInserted": 142
}
```

**Response** (エラー):
```json
{ "success": false, "error": "シート '資産月次推移' が見つかりません" }
```

---

## デザインリファレンス

`design-mockup.html`（リポジトリルートに配置）を参照。  
ダークテーマ。カラートークン：

| 用途 | 値 |
|---|---|
| 背景 | `#0a0d14` |
| サーフェス | `#111827` |
| ボーダー | `#1f2d45` |
| アクセント | `#4f8ef7` |
| 上昇 | `#10b981` |
| 下落 | `#ef4444` |
| ゴールド | `#f59e0b` |

---

## 実装優先順位

1. **Phase 1** — Excel アップロード → 解析 → DB 保存（API Route + parser.ts）
2. **Phase 2** — ダッシュボード画面（KPI・チャート・テーブル）
3. **Phase 3** — アップロード UI（Dropzone・SheetMapper・進捗表示）
4. **Phase 4** — レポート出力（PDF）・月次メール通知

---

## よくある注意点

- Excel のセルが `null` になるケースが多い（スパースな構造）。`null` チェック必須。
- 日付列は `datetime.datetime` オブジェクトで入ってくる場合がある（SheetJS では `Date` 型）。
- 金額は円単位の整数。表示は `toLocaleString('ja-JP')` を使う。
- 「銘柄名」列のフォーマットが時期によって揺れる（例: `楽天全米株式インデックス` vs `楽天・全米株式インデックス・ファンド`）。正規化が必要。
