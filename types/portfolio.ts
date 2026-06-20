// 資産月次推移（1レコード = 1ヶ月）
export interface MonthlyTrend {
  date: Date;
  total: number;        // 総資産（円）
  cash: number;         // 預金・現金・暗号資産
  stock: number;        // 株式（現物）
  trust: number;        // 投資信託
  pension: number;      // 年金
  points: number;       // ポイント
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
}

// 解析結果
export interface ParseResult {
  monthlyTrends: MonthlyTrend[];
  holdings: Holding[];
  sectorAllocations: SectorAllocation[];
  metadata: {
    baseDate: Date;
    totalRecords: number;
    sheetsProcessed: string[];
  };
}

// アップロードファイル情報
export interface UploadedFile {
  url: string;
  uploadedAt: Date;
  filename: string;
}

// セクター別配分
export interface SectorAllocation {
  sector: string;
  percentage: number;
}
