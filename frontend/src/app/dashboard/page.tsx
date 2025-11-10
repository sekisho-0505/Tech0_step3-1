'use client';

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { fetchBreakEvenAnalysis, BreakEvenData } from '@/services/breakEvenService';

export default function DashboardPage() {
  const [breakEvenData, setBreakEvenData] = useState<BreakEvenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchBreakEvenAnalysis();
        setBreakEvenData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          ダッシュボード
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (error || !breakEvenData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          ダッシュボード
        </Typography>
        <Typography color="error">
          {error || 'データを読み込めませんでした'}
        </Typography>
      </Container>
    );
  }

  const achievementPercent = Math.min(
    (Number(breakEvenData.achievement_rate) * 100),
    100
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'danger':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        ダッシュボード
      </Typography>

      <Grid container spacing={3}>
        {/* 売上KPI */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AttachMoneyIcon color="primary" />
                <Typography variant="h6" component="div">
                  今月の売上
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {(breakEvenData.current_revenue / 1000).toLocaleString()}千円
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                対損益分岐点: {Number(breakEvenData.achievement_rate).toFixed(2)}倍
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 損益分岐点KPI */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUpIcon color="secondary" />
                <Typography variant="h6" component="div">
                  損益分岐点
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {(breakEvenData.break_even_revenue / 1000).toLocaleString()}千円
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption">達成率</Typography>
                  <Typography variant="caption">{achievementPercent.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={achievementPercent}
                  color={breakEvenData.status === 'safe' ? 'success' : breakEvenData.status === 'warning' ? 'warning' : 'error'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 粗利率KPI */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PercentIcon color="success" />
                <Typography variant="h6" component="div">
                  粗利率
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ color: getStatusColor(breakEvenData.status) }}>
                {(Number(breakEvenData.gross_margin_rate) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ステータス: {breakEvenData.status === 'safe' ? '良好' : breakEvenData.status === 'warning' ? '注意' : '危険'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 変動費率KPI */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ShowChartIcon color="info" />
                <Typography variant="h6" component="div">
                  変動費率
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {(Number(breakEvenData.variable_cost_rate) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                固定費: {(breakEvenData.fixed_costs / 1000).toLocaleString()}千円
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* サマリー情報 */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                当月サマリー ({breakEvenData.year_month})
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    売上高
                  </Typography>
                  <Typography variant="h6">
                    {breakEvenData.current_revenue.toLocaleString()}円
                  </Typography>
                </Grid>
                <Grid xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    損益分岐点との差額
                  </Typography>
                  <Typography
                    variant="h6"
                    color={breakEvenData.delta_revenue >= 0 ? 'success.main' : 'error.main'}
                  >
                    {breakEvenData.delta_revenue >= 0 ? '+' : ''}
                    {breakEvenData.delta_revenue.toLocaleString()}円
                  </Typography>
                </Grid>
                <Grid xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    達成率
                  </Typography>
                  <Typography variant="h6">
                    {(Number(breakEvenData.achievement_rate) * 100).toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
