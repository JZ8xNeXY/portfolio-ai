import { put, head } from '@vercel/blob';

/**
 * Excelファイルを Vercel Blob にアップロード
 * @param file - アップロードするファイル
 * @returns アップロードされたファイルのURL
 */
export async function uploadExcelFile(file: File): Promise<string> {
  const blob = await put(`portfolio/${file.name}`, file, {
    access: 'private',
  });

  return blob.url;
}

/**
 * 最新のExcelファイルURLを取得（localStorage から）
 * @returns ファイルURL、なければ null
 */
export function getLatestFileUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('latestPortfolioFileUrl');
}

/**
 * 最新のExcelファイルURLを保存（localStorage に）
 * @param url - ファイルURL
 */
export function saveLatestFileUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('latestPortfolioFileUrl', url);
  localStorage.setItem('latestPortfolioUploadedAt', new Date().toISOString());
}

/**
 * Vercel Blob から Excelファイルを取得
 * @param url - ファイルURL
 * @returns ファイルのバッファ
 */
export async function fetchExcelFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ファイルの取得に失敗しました: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
