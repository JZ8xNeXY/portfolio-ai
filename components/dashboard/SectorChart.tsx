'use client';

import { Paper, Typography, Box } from '@mui/material';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
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
  // Treemap用に階層構造のデータを作成
  const treemapData = {
    name: 'Portfolio',
    children: data.map((item) => ({
      name: shortenSectorName(item.sector),
      size: item.percentage,
      fill: SECTOR_COLORS[item.sector] || '#4f8ef7',
    })),
  };

  // カスタムラベル
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, value, depth } = props;

    // ルートノードは表示しない
    if (depth === 1) {
      return null;
    }

    // 小さすぎる領域にはラベルを表示しない
    if (width < 60 || height < 40) {
      return null;
    }

    return (
      <g>
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight={600}
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
          fontWeight={700}
        >
          {value ? value.toFixed(1) : '0'}%
        </text>
      </g>
    );
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: '#111827',
            border: '1px solid #1f2d45',
            borderRadius: '8px',
            p: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="primary.main">
            {data.percentage.toFixed(2)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        セクター別投資割合
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        ポートフォリオのセクター配分（VTI基準）- 面積で割合を表示
      </Typography>

      <ResponsiveContainer width="100%" height={500}>
        <Treemap
          data={[treemapData]}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#0a0d14"
          fill="#4f8ef7"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>

      {/* 詳細リスト */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          詳細
        </Typography>
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
