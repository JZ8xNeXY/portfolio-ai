import * as fs from 'fs';
import * as path from 'path';
import { list } from '@vercel/blob';
import { parsePortfolioExcel } from './excel/parser';
import { ParseResult } from '@/types/portfolio';

/**
 * ポートフォリオデータを取得
 * ローカル環境: ファイルシステムから読み込み
 * Vercel環境: Vercel Blobから最新ファイルを読み込み
 */
export async function getPortfolioData(): Promise<ParseResult | null> {
  try {
    // ローカル環境: ファイルシステムから読み込み
    if (process.env.NODE_ENV === 'development') {
      // 資産運用*.xlsxパターンのファイルを検索
      const files = fs.readdirSync(process.cwd()).filter(f =>
        f.startsWith('資産運用') && (f.endsWith('.xlsx') || f.endsWith('.xls'))
      );

      if (files.length > 0) {
        // 最新のファイルを取得（ファイル名でソート）
        const latestFile = files.sort().reverse()[0];
        const filePath = path.join(process.cwd(), latestFile);
        const fileBuffer = fs.readFileSync(filePath);
        console.log(`読み込みファイル: ${latestFile}`);
        return await parsePortfolioExcel(fileBuffer);
      }
    }

    // Vercel環境: Blobから最新ファイルを取得
    const { blobs } = await list({
      prefix: 'portfolio/',
      limit: 1,
    });

    if (blobs.length === 0) {
      console.log('データファイルが見つかりません。/upload からファイルをアップロードしてください。');
      return null;
    }

    // 最新のファイルをダウンロード
    const latestBlob = blobs[0];
    const response = await fetch(latestBlob.url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // パース
    return await parsePortfolioExcel(buffer);
  } catch (error) {
    console.error('データ取得エラー:', error);
    return null;
  }
}
