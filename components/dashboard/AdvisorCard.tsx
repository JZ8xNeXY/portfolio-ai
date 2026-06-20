'use client';

import {
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { PortfolioAnalysis } from '@/lib/advisor/analyzer';

interface AdvisorCardProps {
  analysis: PortfolioAnalysis;
}

export default function AdvisorCard({ analysis }: AdvisorCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#4f8ef7';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '優秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '普通';
    return '要改善';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          ファイナンシャルアドバイス
        </Typography>
        <Chip
          label={`${getScoreLabel(analysis.score)} (${analysis.score}点)`}
          sx={{
            backgroundColor: `${getScoreColor(analysis.score)}20`,
            color: getScoreColor(analysis.score),
            fontWeight: 600,
          }}
        />
      </Box>

      {/* スコア表示 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            ポートフォリオスコア
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: getScoreColor(analysis.score) }}>
            {analysis.score}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={analysis.score}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1f2d45',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getScoreColor(analysis.score),
            },
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {analysis.summary}
        </Typography>
      </Box>

      {/* アドバイス一覧 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {analysis.advice.map((item, index) => (
          <Alert
            key={index}
            severity={item.type}
            icon={
              item.type === 'success' ? (
                <CheckCircleIcon />
              ) : item.type === 'warning' ? (
                <WarningIcon />
              ) : (
                <InfoIcon />
              )
            }
            sx={{
              backgroundColor:
                item.type === 'success'
                  ? '#10b98110'
                  : item.type === 'warning'
                  ? '#f59e0b10'
                  : '#4f8ef710',
              border: '1px solid',
              borderColor:
                item.type === 'success'
                  ? '#10b98130'
                  : item.type === 'warning'
                  ? '#f59e0b30'
                  : '#4f8ef730',
              '& .MuiAlert-icon': {
                color:
                  item.type === 'success'
                    ? '#10b981'
                    : item.type === 'warning'
                    ? '#f59e0b'
                    : '#4f8ef7',
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>{item.title}</AlertTitle>
            {item.description}
          </Alert>
        ))}
      </Box>

      {/* フッター */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #1f2d45' }}>
        <Typography variant="caption" color="text.secondary">
          ※ このアドバイスは自動生成されたものです。投資判断は自己責任でお願いします。
        </Typography>
      </Box>
    </Paper>
  );
}
