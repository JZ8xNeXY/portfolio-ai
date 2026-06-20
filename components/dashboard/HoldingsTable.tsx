import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { Holding } from '@/types/portfolio';

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString('ja-JP')}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // 「合計」行を除外し、評価額でソート
  const sortedHoldings = holdings
    .filter((h) => h.name !== '合計')
    .sort((a, b) => b.value - a.value);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>銘柄名</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell align="right">保有口数</TableCell>
            <TableCell align="right">平均取得単価</TableCell>
            <TableCell align="right">基準価額</TableCell>
            <TableCell align="right">評価額</TableCell>
            <TableCell align="right">評価損益</TableCell>
            <TableCell align="right">損益率</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedHoldings.map((holding, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {holding.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {holding.institution}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={holding.ticker} size="small" />
              </TableCell>
              <TableCell align="right">
                {holding.quantity.toLocaleString('ja-JP')}
              </TableCell>
              <TableCell align="right">
                {holding.avgCost.toLocaleString('ja-JP')}
              </TableCell>
              <TableCell align="right">
                {holding.price.toLocaleString('ja-JP')}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(holding.value)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{
                    color: holding.profit >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  {holding.profit >= 0 ? '+' : ''}
                  {formatCurrency(holding.profit)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={formatPercent(holding.profitRate)}
                  size="small"
                  sx={{
                    backgroundColor: holding.profitRate >= 0 ? '#10b98120' : '#ef444420',
                    color: holding.profitRate >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
