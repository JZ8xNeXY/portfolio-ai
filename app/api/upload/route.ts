import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { parsePortfolioExcel } from '@/lib/excel/parser';

export async function POST(request: NextRequest) {
  try {
    // FormDataからファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイル拡張子をチェック
    const fileName = file.name;
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Excelファイル (.xlsx, .xls) のみアップロード可能です' },
        { status: 400 }
      );
    }

    // ファイルサイズをチェック（50MB制限）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズが50MBを超えています' },
        { status: 400 }
      );
    }

    // Vercel Blobにアップロード（ストレージの設定に従う）
    const blob = await put(`portfolio/${fileName}`, file, {
      addRandomSuffix: false,
    });

    console.log('Blob uploaded:', blob.url);

    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Excelを解析
    const parseResult = await parsePortfolioExcel(buffer);

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      data: {
        blobUrl: blob.url,
        fileName: fileName,
        sheetsProcessed: parseResult.metadata.sheetsProcessed,
        recordsInserted: parseResult.metadata.totalRecords,
        baseDate: parseResult.metadata.baseDate.toISOString(),
        summary: {
          monthlyTrends: parseResult.monthlyTrends.length,
          holdings: parseResult.holdings.length,
          totalAssets: parseResult.monthlyTrends[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'アップロード処理に失敗しました',
      },
      { status: 500 }
    );
  }
}
