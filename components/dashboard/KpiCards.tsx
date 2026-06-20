import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface KpiData {
  totalAssets: number;
  totalProfit: number;
  profitRate: number;
  monthlyChange: number;
}

interface KpiCardsProps {
  data: KpiData;
}

export default function KpiCards({ data }: KpiCardsProps) {
  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString('ja-JP')}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const kpis = [
    {
      title: '総資産',
      value: formatCurrency(data.totalAssets),
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      color: '#4f8ef7',
    },
    {
      title: '含み益',
      value: formatCurrency(data.totalProfit),
      subtitle: formatPercent(data.profitRate),
      icon: data.totalProfit >= 0 ? <TrendingUpIcon sx={{ fontSize: 40 }} /> : <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: data.totalProfit >= 0 ? '#10b981' : '#ef4444',
    },
    {
      title: '損益率',
      value: formatPercent(data.profitRate),
      icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
      color: data.profitRate >= 0 ? '#10b981' : '#ef4444',
    },
    {
      title: '前月比',
      value: formatPercent(data.monthlyChange),
      icon: data.monthlyChange >= 0 ? <TrendingUpIcon sx={{ fontSize: 40 }} /> : <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: data.monthlyChange >= 0 ? '#10b981' : '#ef4444',
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {kpi.value}
                  </Typography>
                  {kpi.subtitle && (
                    <Typography variant="body2" sx={{ color: kpi.color }}>
                      {kpi.subtitle}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ color: kpi.color, opacity: 0.8 }}>
                  {kpi.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
