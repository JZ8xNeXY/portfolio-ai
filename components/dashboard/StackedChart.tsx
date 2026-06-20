'use client';

import { useState } from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MonthlyTrend } from '@/types/portfolio';

interface StackedChartProps {
  data: (Omit<MonthlyTrend, 'date'> & { date: string })[];
}

export default function StackedChart({ data }: StackedChartProps) {
  const [period, setPeriod] = useState<'all' | '3y' | '1y'>('3y');

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
          カテゴリ別資産推移
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
        <AreaChart data={chartData}>
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
          <Area
            type="monotone"
            dataKey="投資信託"
            stackId="1"
            stroke="#4f8ef7"
            fill="#4f8ef7"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="年金"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="株式"
            stackId="1"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="現金"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
