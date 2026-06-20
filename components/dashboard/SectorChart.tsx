'use client';

import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

export default function SectorChart({ data }: SectorChartProps) {
  const formatTooltip = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatYAxis = (value: number) => {
    return `${value}%`;
  };

  // セクター名を短縮
  const shortenSectorName = (name: string) => {
    return name
      .replace('(not essential)', '')
      .replace('(essential)', '')
      .trim();
  };

  const chartData = data.map(item => ({
    ...item,
    displayName: shortenSectorName(item.sector),
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        セクター別投資割合
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        ポートフォリオのセクター配分（VTI基準）
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
          <XAxis
            type="number"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            tickFormatter={formatYAxis}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            width={150}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1f2d45',
              borderRadius: '8px',
            }}
            formatter={formatTooltip}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={SECTOR_COLORS[entry.sector] || '#4f8ef7'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 詳細リスト */}
      <Box sx={{ mt: 3 }}>
        {data.map((item, index) => (
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
