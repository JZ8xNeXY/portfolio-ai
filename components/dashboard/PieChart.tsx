'use client';

import { Paper, Typography, Box } from '@mui/material';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { MonthlyTrend } from '@/types/portfolio';

interface AssetPieChartProps {
  data: Omit<MonthlyTrend, 'date'> & { date: string };
}

export default function AssetPieChart({ data }: AssetPieChartProps) {
  const chartData = [
    { name: '投資信託', value: data.trust, color: '#4f8ef7' },
    { name: '現金・預金', value: data.cash, color: '#10b981' },
    { name: '年金', value: data.pension, color: '#f59e0b' },
    { name: '株式', value: data.stock, color: '#8b5cf6' },
    { name: 'ポイント', value: data.points, color: '#ec4899' },
  ].filter((item) => item.value > 0); // 0円の項目は除外

  const formatTooltip = (value: number) => {
    const percentage = ((value / data.total) * 100).toFixed(1);
    return `¥${value.toLocaleString('ja-JP')} (${percentage}%)`;
  };

  const renderLabel = (entry: any) => {
    const percentage = ((entry.value / data.total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          資産配分
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          最新データ: {new Date(data.date).toLocaleDateString('ja-JP')}
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={350}>
        <RechartsPie>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1f2d45',
              borderRadius: '8px',
            }}
            formatter={formatTooltip}
          />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>

      {/* 詳細リスト */}
      <Box sx={{ mt: 2 }}>
        {chartData.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1,
              borderBottom: index < chartData.length - 1 ? '1px solid #1f2d45' : 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                }}
              />
              <Typography variant="body2">{item.name}</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ¥{item.value.toLocaleString('ja-JP')}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
