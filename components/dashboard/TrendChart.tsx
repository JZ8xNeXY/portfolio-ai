'use client';

import { useState } from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MonthlyTrend } from '@/types/portfolio';

interface TrendChartProps {
  data: (Omit<MonthlyTrend, 'date'> & { date: string })[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const [period, setPeriod] = useState<'all' | '3y' | '1y'>('all');

  // 期間フィルター
  const getFilteredData = () => {
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (period === '1y') {
      return sortedData.slice(-12);
    } else if (period === '3y') {
      return sortedData.slice(-36);
    }
    return sortedData;
  };

  const filteredData = getFilteredData();

  // チャート用にデータを整形
  const chartData = filteredData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
    総資産: item.total,
    投資信託: item.trust,
    年金: item.pension,
    株式: item.stock,
    現金: item.cash,
  }));

  const formatYAxis = (value: number) => {
    return `¥${(value / 10000).toFixed(0)}万`;
  };

  const formatTooltip = (value: number) => {
    return `¥${value.toLocaleString('ja-JP')}`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          総資産推移
        </Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, value) => value && setPeriod(value)}
          size="small"
        >
          <ToggleButton value="1y">1年</ToggleButton>
          <ToggleButton value="3y">3年</ToggleButton>
          <ToggleButton value="all">全期間</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            tickMargin={10}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            tickFormatter={formatYAxis}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1f2d45',
              borderRadius: '8px',
            }}
            formatter={formatTooltip}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="総資産"
            stroke="#4f8ef7"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
