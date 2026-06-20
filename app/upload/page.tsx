import { Container, Box, Typography, Paper } from '@mui/material';
import Dropzone from '@/components/upload/Dropzone';

export default function UploadPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            データ取込
          </Typography>
          <Typography variant="body1" color="text.secondary">
            資産運用Excelファイルをアップロードしてください
          </Typography>
        </Box>

        {/* ドロップゾーン */}
        <Dropzone />

        {/* 説明 */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            アップロード方法
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>資産運用(YYMMDD).xlsx</strong> ファイルを準備
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              上のエリアにドラッグ&ドロップ、またはクリックして選択
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              自動的に解析され、Vercel Blobに保存されます
            </Typography>
            <Typography component="li" variant="body2">
              完了後、ダッシュボードへ自動的に移動します
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              必須シート
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 資産月次推移（月次総資産・カテゴリ別残高）
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 資産運用状況（保有銘柄一覧）
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
