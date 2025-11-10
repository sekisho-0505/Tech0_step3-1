'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CalculateIcon from '@mui/icons-material/Calculate';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { fetchBreakEvenCurrent } from '@/services/breakEvenService';
import type { BreakEvenResponse } from '@/types/breakEven';

export default function DashboardPage() {
  const [data, setData] = useState<BreakEvenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchBreakEvenCurrent();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'データの読み込みに失敗しました',
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  const statusColors = {
    safe: 'success' as const,
    warning: 'warning' as const,
    danger: 'error' as const,
  };

  const statusText = {
    safe: '安全',
    warning: '注意',
    danger: '危険',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* ヘッダー */}
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>

      {/* ナビゲーション */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button component={Link} href="/" variant="outlined">
          価格シミュレーション
        </Button>
        <Button component={Link} href="/dashboard" variant="contained">
          ダッシュボード
        </Button>
        <Button component={Link} href="/import" variant="outlined">
          インポート
        </Button>
      </Box>

      {/* KPIカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 今月の売上 */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                今月の売上
              </Typography>
              <Typography variant="h4" component="div">
                {(data.currentRevenue / 1000).toLocaleString()}
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  千円
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 損益分岐点 */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                損益分岐点
              </Typography>
              <Typography variant="h4" component="div">
                {(data.breakEvenRevenue / 1000).toLocaleString()}
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  千円
                </Typography>
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data.achievementRate * 100, 100)}
                  color={statusColors[data.status]}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  達成率: {(data.achievementRate * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 粗利率 */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                粗利率
              </Typography>
              <Typography variant="h4" component="div">
                {(data.grossMarginRate * 100).toFixed(1)}
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  %
                </Typography>
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={statusText[data.status]}
                  color={statusColors[data.status]}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 変動費率 */}
        <Grid xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                変動費率
              </Typography>
              <Typography variant="h4" component="div">
                {(data.variableCostRate * 100).toFixed(1)}
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  %
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* トレンドテーブル */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            月次トレンド
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>月</TableCell>
                  <TableCell align="right">売上高</TableCell>
                  <TableCell align="right">損益分岐点</TableCell>
                  <TableCell align="right">達成状況</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.trend.map((item) => {
                  const achievement = (item.revenue / item.breakEven) * 100;
                  const isAchieved = achievement >= 100;
                  return (
                    <TableRow key={item.month}>
                      <TableCell component="th" scope="row">
                        {item.month}
                      </TableCell>
                      <TableCell align="right">
                        {(item.revenue / 1000).toLocaleString()} 千円
                      </TableCell>
                      <TableCell align="right">
                        {(item.breakEven / 1000).toLocaleString()} 千円
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${achievement.toFixed(1)}%`}
                          color={isAchieved ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* クイックアクション */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Box>
                <Typography variant="h6">価格シミュレーション</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  新しい価格を計算する
                </Typography>
              </Box>
              <CalculateIcon sx={{ fontSize: 48 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card
            component={Link}
            href="/import"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'success.main',
                color: 'success.contrastText',
              }}
            >
              <Box>
                <Typography variant="h6">Excelインポート</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  データをアップロードする
                </Typography>
              </Box>
              <UploadFileIcon sx={{ fontSize: 48 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
