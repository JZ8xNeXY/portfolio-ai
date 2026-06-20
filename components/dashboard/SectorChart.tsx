'use client';

import { Paper, Typography, Box } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { SectorAllocation } from '@/types/portfolio';

interface SectorChartProps {
  data: SectorAllocation[];
}

// セクター別の色
const SECTOR_COLORS: Record<string, string> = {
  'Technorogy': '#4f8ef7',
  'Technology': '#4f8ef7',
  'Consumer Discretionary(not essential)': '#10b981',
  'Industrials': '#f59e0b',
  'Financials': '#8b5cf6',
  'Health Care': '#ec4899',
  'Energy': '#ef4444',
  'Consumer Staples(essential)': '#06b6d4',
  'Utilites': '#84cc16',
  'Real Estate': '#f97316',
  'Telecommnunications': '#a855f7',
  'Materials': '#64748b',
};

// セクター名を短縮
const shortenSectorName = (name: string) => {
  return name
    .replace('(not essential)', '')
    .replace('(essential)', '')
    .trim();
};

export default function SectorChart({ data }: SectorChartProps) {
  // 円グラフ用にデータを整形
  const chartData = data.map((item) => ({
    name: shortenSectorName(item.sector),
    value: item.percentage,
    color: SECTOR_COLORS[item.sector] || '#4f8ef7',
  }));

  const formatTooltip = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const renderLabel = (entry: any) => {
    // 5%以上の場合のみラベルを表示
    if (entry.value >= 5) {
      return `${entry.value.toFixed(1)}%`;
    }
    return '';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        セクター別投資割合
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        ポートフォリオのセクター配分（VTI基準）- 円グラフで割合を表示
      </Typography>

      {/* 円グラフ */}
      <Box sx={{ width: '100%', height: 450 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={140}
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
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* 詳細リスト */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          詳細
        </Typography>
        {data
          .sort((a, b) => b.percentage - a.percentage)
          .map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
                borderBottom: index < data.length - 1 ? '1px solid #1f2d45' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '2px',
                    backgroundColor: SECTOR_COLORS[item.sector] || '#4f8ef7',
                  }}
                />
                <Typography variant="body2">{shortenSectorName(item.sector)}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.percentage.toFixed(2)}%
              </Typography>
            </Box>
          ))}
      </Box>
    </Paper>
  );
}
