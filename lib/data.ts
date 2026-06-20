import * as fs from 'fs';
import * as path from 'path';
import { parsePortfolioExcel } from './excel/parser';
import { ParseResult } from '@/types/portfolio';

/**
 * テスト用: ローカルのExcelファイルを読み込んで解析
 * 本番では Vercel Blob から取得する
 */
export async function getPortfolioData(): Promise<ParseResult | null> {
  try {
    // プロジェクトルートからの絶対パス
    const filePath = path.join(process.cwd(), '資産運用(080630) .xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    return await parsePortfolioExcel(fileBuffer);
  } catch (error) {
    console.error('データ取得エラー:', error);
    return null;
  }
}
