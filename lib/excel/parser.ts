import * as XLSX from 'xlsx';
import { MonthlyTrend, Holding, ParseResult, SectorAllocation } from '@/types/portfolio';

/**
 * Excelシリアル値をDateオブジェクトに変換
 */
function excelDateToDate(serial: number): Date {
  if (!serial || typeof serial !== 'number' || isNaN(serial)) {
    throw new Error(`Invalid Excel date serial: ${serial}`);
  }
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 86400000);

  if (isNaN(date.getTime())) {
    throw new Error(`Failed to convert Excel date: ${serial}`);
  }

  return date;
}

/**
 * 資産月次推移シートを解析
 */
function parseMonthlyTrends(sheet: XLSX.WorkSheet): MonthlyTrend[] {
  const rawData = XLSX.utils.sheet_to_json<any>(sheet);

  return rawData
    .filter((row) => {
      // 日付が数値であることを確認（ヘッダー行を除外）
      if (typeof row['日付'] !== 'number' || !row['合計（）']) {
        return false;
      }

      // 合計が妥当な範囲内か確認（100万円以上）
      // 古いデータや不完全なデータを除外
      const total = row['合計（）'];
      return total >= 1000000;
    })
    .map((row) => ({
      date: excelDateToDate(row['日付']),
      total: row['合計（）'] || 0,
      cash: row['預金・現金・暗号資産（）'] || 0,
      stock: row['株式(現物)（）'] || 0,
      trust: row['投資信託（）'] || 0,
      pension: row['年金（）'] || 0,
      points: row['ポイント（）'] || 0,
    }));
}

/**
 * 資産運用状況シートを解析
 */
function parseHoldings(sheet: XLSX.WorkSheet): Holding[] {
  const rawData = XLSX.utils.sheet_to_json<any>(sheet);

  return rawData
    .filter((row) => row['__EMPTY_2'] && row['__EMPTY_2'] !== '銘柄名') // ヘッダー行をスキップ
    .map((row) => ({
      ticker: row['__EMPTY_1'] || '',
      name: row['__EMPTY_2'] || '',
      quantity: Number(row['__EMPTY_3']) || 0,
      avgCost: Number(row['__EMPTY_4']) || 0,
      price: Number(row['__EMPTY_5']) || 0,
      value: Number(row['__EMPTY_6']) || 0,
      previousDayChange: Number(row['__EMPTY_7']) || 0,
      profit: Number(row['__EMPTY_8']) || 0,
      profitRate: Number(row['__EMPTY_9']) || 0,
      institution: row['__EMPTY_10'] || '',
    }));
}

/**
 * セクター割合シートを解析（最新データのみ）
 */
function parseSectorAllocations(sheet: XLSX.WorkSheet): SectorAllocation[] {
  const rawData = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

  // 日付行を見つける（行2）
  const dateRow = rawData[2] || [];
  const dates = dateRow.filter((cell: any) => typeof cell === 'number' && cell > 44000);

  if (dates.length === 0) {
    return [];
  }

  // 最新日付のインデックスを取得
  const latestDateIndex = dateRow.lastIndexOf(Math.max(...dates));

  // セクターデータを抽出（VTIセクションの最初のブロック）
  const sectors: SectorAllocation[] = [];
  let foundVTI = false;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];

    // VTI行を見つける
    if (row[0] === 'VTI') {
      foundVTI = true;
      continue;
    }

    // VTIセクション内のセクター行を処理
    if (foundVTI && row[1] && typeof row[1] === 'string') {
      const sectorName = row[1];

      // 「合計」行で終了
      if (sectorName === '合計') {
        break;
      }

      // 最新の割合を取得
      const percentage = row[latestDateIndex];

      if (typeof percentage === 'number' && percentage > 0) {
        sectors.push({
          sector: sectorName,
          percentage: percentage * 100, // パーセント表示に変換
        });
      }
    }
  }

  // 割合でソート（降順）
  return sectors.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Excelファイルを解析してデータを返す
 * @param fileBuffer - アップロードされたExcelファイルのバッファ
 * @returns 解析結果
 */
export async function parsePortfolioExcel(
  fileBuffer: Buffer
): Promise<ParseResult> {
  const workbook = XLSX.read(fileBuffer);

  // 必須シートの存在チェック
  const requiredSheets = ['資産月次推移', '資産運用状況'];
  const missingSheets = requiredSheets.filter(
    (name) => !workbook.SheetNames.includes(name)
  );

  if (missingSheets.length > 0) {
    throw new Error(
      `必須シート「${missingSheets.join('、')}」が見つかりません`
    );
  }

  // 各シートを解析
  const monthlyTrends = parseMonthlyTrends(
    workbook.Sheets['資産月次推移']
  );
  const holdings = parseHoldings(workbook.Sheets['資産運用状況']);

  // セクター割合（オプション）
  const sectorAllocations = workbook.SheetNames.includes('セクター割合')
    ? parseSectorAllocations(workbook.Sheets['セクター割合'])
    : [];

  // 基準日は最新の月次データから取得
  const baseDate =
    monthlyTrends.length > 0
      ? monthlyTrends[0].date
      : new Date();

  const sheetsProcessed = ['資産月次推移', '資産運用状況'];
  if (sectorAllocations.length > 0) {
    sheetsProcessed.push('セクター割合');
  }

  return {
    monthlyTrends,
    holdings,
    sectorAllocations,
    metadata: {
      baseDate,
      totalRecords: monthlyTrends.length + holdings.length + sectorAllocations.length,
      sheetsProcessed,
    },
  };
}
