'use client';

import { Paper, Typography, Box } from '@mui/material';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
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

// ツリーマップのカスタムコンテンツ
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value } = props;

  // 面積が小さすぎる場合はラベルを表示しない
  const showLabel = width > 60 && height > 40;
  const showPercentage = width > 40 && height > 25;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: props.fill,
          stroke: '#0a0d14',
          strokeWidth: 2,
          cursor: 'pointer',
        }}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 14 : 11}
          fontWeight="600"
        >
          {shortenSectorName(name)}
        </text>
      )}
      {showPercentage && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (showLabel ? 12 : 4)}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 16 : 13}
          fontWeight="700"
        >
          {value.toFixed(1)}%
        </text>
      )}
    </g>
  );
};

export default function SectorChart({ data }: SectorChartProps) {
  // ツリーマップ用にデータを整形
  const treemapData = data.map((item) => ({
    name: item.sector,
    value: item.percentage,
    fill: SECTOR_COLORS[item.sector] || '#4f8ef7',
  }));

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toFixed(2)}%`, shortenSectorName(name)];
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        セクター別投資割合
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        ポートフォリオのセクター配分（VTI基準）- 面積で割合を表示
      </Typography>

      {/* ツリーマップ */}
      <Box sx={{ width: '100%', height: 450 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#0a0d14"
            fill="#8884d8"
            content={<CustomTreemapContent />}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #1f2d45',
                borderRadius: '8px',
              }}
              formatter={formatTooltip}
            />
          </Treemap>
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
