'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Paper, LinearProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';

interface UploadResult {
  success: boolean;
  data?: {
    blobUrl: string;
    fileName: string;
    sheetsProcessed: string[];
    recordsInserted: number;
    summary: {
      monthlyTrends: number;
      holdings: number;
      totalAssets: number;
    };
  };
  error?: string;
}

export default function Dropzone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // アップロード進捗をシミュレート
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data: UploadResult = await response.json();

      if (data.success) {
        setResult(data);
        // Blob URLをlocalStorageに保存
        if (data.data) {
          localStorage.setItem('latestPortfolioFileUrl', data.data.blobUrl);
          localStorage.setItem('latestPortfolioUploadedAt', new Date().toISOString());
        }
        // 2秒後にダッシュボードへリダイレクト
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      } else {
        setError(data.error || 'アップロードに失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await uploadFile(files[0]);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await uploadFile(files[0]);
      }
    },
    []
  );

  return (
    <Box>
      {/* ドロップゾーン */}
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 6,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {!isUploading && !result && (
          <>
            <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Excelファイルをドラッグ&ドロップ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              または、クリックしてファイルを選択
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              対応形式: .xlsx, .xls （最大50MB）
            </Typography>
          </>
        )}

        {isUploading && (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              アップロード中...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {uploadProgress}%
            </Typography>
          </Box>
        )}

        {result && result.success && (
          <Box>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              アップロード完了！
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ダッシュボードへ移動します...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* 成功メッセージ */}
      {result && result.success && result.data && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>{result.data.fileName}</strong> を正常にアップロードしました
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            処理シート: {result.data.sheetsProcessed.join(', ')}
          </Typography>
          <Typography variant="caption" display="block">
            データ件数: {result.data.recordsInserted}件
            （月次データ: {result.data.summary.monthlyTrends}件、銘柄: {result.data.summary.holdings}件）
          </Typography>
          <Typography variant="caption" display="block">
            総資産: ¥{result.data.summary.totalAssets.toLocaleString('ja-JP')}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
