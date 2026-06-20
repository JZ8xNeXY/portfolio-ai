import * as fs from 'fs';
import * as path from 'path';
import { parsePortfolioExcel } from './excel/parser';
import { ParseResult } from '@/types/portfolio';

/**
 * ポートフォリオデータを取得
 * ローカル環境: ファイルシステムから読み込み
 * Vercel環境: Vercel Blobから読み込み（未実装 - 常にnullを返す）
 */
export async function getPortfolioData(): Promise<ParseResult | null> {
  try {
    // ローカル環境でのみExcelファイルを読み込む
    if (process.env.NODE_ENV === 'development') {
      const filePath = path.join(process.cwd(), '資産運用(080630) .xlsx');
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return await parsePortfolioExcel(fileBuffer);
      }
    }

    // Vercel環境では、アップロード機能を使用してもらう
    console.log('データファイルが見つかりません。/upload からファイルをアップロードしてください。');
    return null;
  } catch (error) {
    console.error('データ取得エラー:', error);
    return null;
  }
}
