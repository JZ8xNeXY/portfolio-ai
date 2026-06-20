# 詳細要件定義 — PortfolioAI

**作成日**: 2026-06-20
**ステータス**: Phase 1 実装前の要件確定

---

## 1. データソース仕様

### 1.1 Excelファイル構造（実測値）

| シート名 | 行数 | 主要カラム | データ形式 | Phase 1対応 |
|---|---|---|---|---|
| 資産月次推移 | 161 | 日付、合計、預金・現金・暗号資産、株式、投資信託、年金、ポイント | 行=月次、列=カテゴリ | ✅ 最優先 |
| 資産運用状況 | 55 | ticker、銘柄名、保有数、評価額、評価損益、損益率 | 行=銘柄 | ✅ 高優先度 |
| 全資産割合 | 18 | カテゴリ、ticker、日付列（動的） | 行=銘柄、列=日付 | ⚠️ Phase 2 |
| 財務諸表 | 1049 | 資産の部、流動資産、固定資産 | BS形式 | ❌ Phase 3 |
| 資産割合 | 962 | 投資配分（IDECO含む） | 行=銘柄、列=日付 | ❌ Phase 3 |
| 資産状況 | 972 | 口座別残高 | 行=口座、列=日付 | ❌ Phase 3 |
| セクター割合 | 888 | VTI等のセクター比率 | 行=セクター、列=日付 | ❌ Phase 4 |
| 毎月積立額 | 913 | 積立設定額 | 行=設定、列=日付 | ❌ Phase 4 |

### 1.2 データクレンジング要件

#### 日付正規化
```typescript
// Excelシリアル値 → ISO 8601形式
46022 → "2026-01-02"

// 実装方針
const excelEpoch = new Date(1899, 11, 30);
const date = new Date(excelEpoch.getTime() + serialValue * 86400000);
```

#### 列名正規化
```typescript
// Before: "__EMPTY_2"、"合計（）"
// After: "ticker"、"total"

const columnMap = {
  "日付": "date",
  "合計（）": "total",
  "預金・現金・暗号資産（）": "cash",
  "株式(現物)（）": "stock",
  "投資信託（）": "trust",
  "年金（）": "pension",
  "ポイント（）": "points",
  "__EMPTY_1": "ticker",
  "__EMPTY_2": "name",
  "__EMPTY_3": "quantity",
  // ...
};
```

#### null値処理
- 必須フィールド（日付、評価額など）が null → エラーをスロー
- 任意フィールド（前日比など）が null → 0 or null のまま保持

---

## 2. データモデル（Phase 1確定版）

### 2.1 型定義（types/portfolio.ts）

```typescript
// 資産月次推移（1レコード = 1ヶ月）
export interface MonthlyTrend {
  date: Date;           // 月末日
  total: number;        // 総資産（円）
  cash: number;         // 預金・現金・暗号資産
  stock: number;        // 株式（現物）
  trust: number;        // 投資信託
  pension: number;      // 年金
  points: number;       // ポイント
  uploadId: string;     // FK: uploads.id
}

// 保有銘柄（1レコード = 1銘柄）
export interface Holding {
  ticker: string;           // 分類コード（VTI、VWO、金 等）
  name: string;             // 銘柄名
  institution: string;      // 保有金融機関
  quantity: number;         // 保有口数
  avgCost: number;          // 平均取得単価
  price: number;            // 基準価額
  value: number;            // 評価額（円）
  previousDayChange: number; // 前日比
  profit: number;           // 評価損益（円）
  profitRate: number;       // 損益率（0.3595 = 35.95%）
  uploadId: string;         // FK: uploads.id
}

// アップロード履歴
export interface Upload {
  id: string;
  filename: string;
  blobUrl: string;
  baseDate: Date;
  tag?: string;
  sheetsProcessed: string[];
  recordsInserted: number;
  createdAt: Date;
}
```

### 2.2 DBスキーマ（Vercel Postgres）

```sql
-- アップロード履歴
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  base_date DATE NOT NULL,
  tag TEXT,
  sheets_processed TEXT[] NOT NULL,
  records_inserted INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 資産月次推移
CREATE TABLE monthly_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total BIGINT NOT NULL,
  cash BIGINT NOT NULL,
  stock BIGINT NOT NULL,
  trust BIGINT NOT NULL,
  pension BIGINT NOT NULL,
  points INT NOT NULL,
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
  UNIQUE(date, upload_id)
);

-- 保有銘柄
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  avg_cost NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  value BIGINT NOT NULL,
  previous_day_change NUMERIC DEFAULT 0,
  profit BIGINT NOT NULL,
  profit_rate NUMERIC NOT NULL,
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_monthly_trends_date ON monthly_trends(date DESC);
CREATE INDEX idx_holdings_ticker ON holdings(ticker);
CREATE INDEX idx_uploads_base_date ON uploads(base_date DESC);
```

---

## 3. パーサー仕様（lib/excel/parser.ts）

### 3.1 関数シグネチャ

```typescript
export interface ParseResult {
  monthlyTrends: MonthlyTrend[];
  holdings: Holding[];
  metadata: {
    baseDate: Date;
    totalRecords: number;
    sheetsProcessed: string[];
  };
}

export async function parsePortfolioExcel(
  fileBuffer: Buffer
): Promise<ParseResult>;
```

### 3.2 実装手順

1. **ワークブックの読み込み**
   ```typescript
   const workbook = XLSX.read(fileBuffer);
   ```

2. **シート存在チェック**
   ```typescript
   if (!workbook.SheetNames.includes('資産月次推移')) {
     throw new Error('必須シート「資産月次推移」が見つかりません');
   }
   ```

3. **資産月次推移の解析**
   ```typescript
   const sheet = workbook.Sheets['資産月次推移'];
   const rawData = XLSX.utils.sheet_to_json(sheet);

   const monthlyTrends = rawData.map(row => ({
     date: excelDateToDate(row['日付']),
     total: row['合計（）'],
     cash: row['預金・現金・暗号資産（）'],
     stock: row['株式(現物)（）'],
     trust: row['投資信託（）'],
     pension: row['年金（）'],
     points: row['ポイント（）'],
   }));
   ```

4. **資産運用状況の解析**
   ```typescript
   const holdingsSheet = workbook.Sheets['資産運用状況'];
   const holdingsRaw = XLSX.utils.sheet_to_json(holdingsSheet);

   // ヘッダー行をスキップ（1行目が列名）
   const holdings = holdingsRaw.slice(1).map(row => ({
     ticker: row['__EMPTY_1'],
     name: row['__EMPTY_2'],
     quantity: row['__EMPTY_3'],
     avgCost: row['__EMPTY_4'],
     price: row['__EMPTY_5'],
     value: row['__EMPTY_6'],
     previousDayChange: row['__EMPTY_7'] || 0,
     profit: row['__EMPTY_8'],
     profitRate: row['__EMPTY_9'],
     institution: row['__EMPTY_10'],
   }));
   ```

5. **バリデーション**
   - 日付が有効か
   - 金額が負数でないか
   - 必須フィールドが null でないか

---

## 4. API仕様（app/api/upload/route.ts）

### 4.1 エンドポイント

**POST /api/upload**

### 4.2 リクエスト

```typescript
Content-Type: multipart/form-data

{
  file: File,              // .xlsx ファイル（最大50MB）
  mode: "append" | "overwrite",
  baseDate: "YYYY-MM-DD",  // 基準日（任意）
}
```

### 4.3 レスポンス

**成功（200）**
```json
{
  "success": true,
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000",
    "sheetsProcessed": ["資産月次推移", "資産運用状況"],
    "recordsInserted": 216,
    "baseDate": "2026-01-02"
  }
}
```

**エラー（400）**
```json
{
  "success": false,
  "error": "シート「資産月次推移」が見つかりません"
}
```

### 4.4 処理フロー

1. ファイルバリデーション（MIME type、サイズ）
2. Vercel Blobへアップロード
3. Excel解析（parser.ts）
4. トランザクション開始
   - uploads テーブルに挿入
   - mode が "overwrite" なら既存データ削除
   - monthly_trends、holdings に挿入
5. トランザクションコミット
6. レスポンス返却

---

## 5. ダッシュボード要件（app/page.tsx）

### 5.1 KPIカード（4枚）

| KPI | 計算式 | データソース |
|---|---|---|
| 総資産 | `latest.total` | monthly_trends |
| 含み益 | `SUM(holdings.profit)` | holdings |
| 損益率 | `含み益 / (総資産 - 含み益) * 100` | 計算 |
| 前月比 | `(今月 - 先月) / 先月 * 100` | monthly_trends |

**表示形式**
- 金額: `¥106,755,195` (toLocaleString('ja-JP'))
- 割合: `+72.4%` (緑) / `-5.2%` (赤)

### 5.2 チャート

#### A. 総資産推移（LineChart）
- X軸: 日付（月次）
- Y軸: 総資産（円）
- 期間切替: 全期間 / 3年 / 1年

#### B. 資産配分（PieChart）
- データ: 最新月の cash、stock、trust、pension、points
- ラベル: カテゴリ名 + 金額 + 割合

#### C. カテゴリ別推移（StackedAreaChart）
- X軸: 日付
- Y軸: 積み上げ金額
- 色分け: cash、stock、trust、pension

#### D. 保有銘柄テーブル
- カラム: ticker、銘柄名、評価額、評価損益、損益率
- ソート: 評価額降順
- 行クリック → 詳細モーダル（Phase 2）

---

## 6. 受け入れ条件（Phase 1完了の定義）

### 必須条件
- [ ] `資産運用(080630).xlsx` をアップロードして正常に取込完了
- [ ] ダッシュボードに以下が表示される
  - 総資産: **¥106,755,195**
  - 含み益: **+¥40,266,694**
  - 損益率: **+72.4%**
- [ ] 月次推移チャートに161ヶ月分のデータが表示される
- [ ] 保有銘柄テーブルに55件の銘柄が表示される

### パフォーマンス
- [ ] アップロード → 解析 → DB保存が10秒以内
- [ ] ダッシュボード初期表示が2秒以内（LCP）

### エラーハンドリング
- [ ] シート不足時にわかりやすいエラーメッセージ
- [ ] ファイル形式エラー時にトースト通知
- [ ] DB接続エラー時にリトライ機能

---

## 7. Phase 1スコープ外（明示的に除外）

- アップロード履歴の一覧表示（Phase 2）
- シートマッパー（手動列指定）（Phase 3）
- PDF出力（Phase 4）
- 認証機能（Phase 2）
- 全資産割合シートの解析（Phase 2）
- レスポンシブ対応の最適化（Phase 2で調整）

---

## 8. 次のアクションアイテム

### 開発環境セットアップ
1. Next.js 14 プロジェクト作成
2. Vercel Postgres / Blob のセットアップ
3. shadcn/ui インストール

### コアロジック実装
1. types/portfolio.ts の作成
2. lib/excel/parser.ts の実装
3. app/api/upload/route.ts の実装

### UI実装
1. app/layout.tsx（Sidebar + Topbar）
2. app/page.tsx（ダッシュボード）
3. components/dashboard/* の実装

---

**質問・確認事項**
- アップロード時、既存データを「追記」と「上書き」どちらをデフォルトにするか？
- 損益率の計算式は `評価損益 / (評価額 - 評価損益)` で正しいか？
- ダッシュボードの期間フィルタは「全期間」「3年」「1年」で十分か？
