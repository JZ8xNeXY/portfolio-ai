import { Box, Container, Typography, Grid } from '@mui/material';
import { getPortfolioData } from '@/lib/data';
import { analyzePortfolio } from '@/lib/advisor/analyzer';
import KpiCards from '@/components/dashboard/KpiCards';
import TrendChart from '@/components/dashboard/TrendChart';
import AssetPieChart from '@/components/dashboard/PieChart';
import StackedChart from '@/components/dashboard/StackedChart';
import SectorChart from '@/components/dashboard/SectorChart';
import AdvisorCard from '@/components/dashboard/AdvisorCard';

export default async function HomePage() {
  const data = await getPortfolioData();

  if (!data) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            データが見つかりません
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Excelファイルをアップロードしてください。
          </Typography>
        </Box>
      </Container>
    );
  }

  // KPIデータを計算
  const latestTrend = data.monthlyTrends[0];
  const previousTrend = data.monthlyTrends[1];

  // 「合計」行から含み益を取得
  const summaryRow = data.holdings.find((h) => h.name === '合計');
  const totalProfit = summaryRow?.profit || 0;
  const totalValue = summaryRow?.value || 0;
  const profitRate = totalValue > 0 ? (totalProfit / (totalValue - totalProfit)) * 100 : 0;

  // 前月比を計算
  const monthlyChange = previousTrend
    ? ((latestTrend.total - previousTrend.total) / previousTrend.total) * 100
    : 0;

  const kpiData = {
    totalAssets: latestTrend.total,
    totalProfit,
    profitRate,
    monthlyChange,
  };

  // ポートフォリオ分析
  const analysis = analyzePortfolio(data.monthlyTrends, data.sectorAllocations);

  // Dateオブジェクトを文字列に変換（Client Componentに渡すため）
  const serializedMonthlyTrends = data.monthlyTrends.map(trend => ({
    ...trend,
    date: trend.date instanceof Date ? trend.date.toISOString() : new Date(trend.date).toISOString(),
  }));

  const serializedLatestTrend = {
    ...latestTrend,
    date: latestTrend.date instanceof Date ? latestTrend.date.toISOString() : new Date(latestTrend.date).toISOString(),
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            PortfolioAI
          </Typography>
          <Typography variant="body1" color="text.secondary">
            資産運用ダッシュボード - 最終更新: {latestTrend.date.toLocaleDateString('ja-JP')}
          </Typography>
        </Box>

        {/* KPI カード */}
        <KpiCards data={kpiData} />

        {/* ファイナンシャルアドバイス */}
        <Box sx={{ mt: 4 }}>
          <AdvisorCard analysis={analysis} />
        </Box>

        {/* 総資産推移チャート */}
        <Box sx={{ mt: 4 }}>
          <TrendChart data={serializedMonthlyTrends as any} />
        </Box>

        {/* 資産配分 & カテゴリ別推移 */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={5}>
            <AssetPieChart data={serializedLatestTrend as any} />
          </Grid>
          <Grid item xs={12} md={7}>
            <StackedChart data={serializedMonthlyTrends as any} />
          </Grid>
        </Grid>

        {/* セクター別投資割合 */}
        {data.sectorAllocations.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <SectorChart data={data.sectorAllocations} />
          </Box>
        )}
      </Box>
    </Container>
  );
}
