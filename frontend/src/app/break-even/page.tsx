'use client';

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { fetchBreakEvenCurrent } from '@/services/breakEvenService';
import type { BreakEvenResponse } from '@/types/breakEven';

export default function BreakEvenPage() {
  const [breakEvenData, setBreakEvenData] =
    useState<BreakEvenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchBreakEvenCurrent();
        setBreakEvenData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          損益分岐点詳細
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (error || !breakEvenData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          損益分岐点詳細
        </Typography>
        <Alert severity="error">{error || 'データを読み込めませんでした'}</Alert>
      </Container>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'safe':
        return '良好';
      case 'warning':
        return '注意';
      case 'danger':
        return '危険';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'safe':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">損益分岐点詳細</Typography>
        <Chip
          label={getStatusLabel(breakEvenData.status)}
          color={getStatusColor(breakEvenData.status)}
        />
      </Box>

      <Grid container spacing={3}>
        {/* サマリーカード */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {breakEvenData.yearMonth} サマリー
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>項目</TableCell>
                    <TableCell align="right">金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>売上高</TableCell>
                    <TableCell align="right">
                      {breakEvenData.currentRevenue.toLocaleString()}円
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>損益分岐点売上高</TableCell>
                    <TableCell align="right">
                      {breakEvenData.breakEvenRevenue.toLocaleString()}円
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>差額</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color:
                          breakEvenData.deltaRevenue >= 0
                            ? 'success.main'
                            : 'error.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {breakEvenData.deltaRevenue >= 0 ? '+' : ''}
                      {breakEvenData.deltaRevenue.toLocaleString()}円
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>固定費</TableCell>
                    <TableCell align="right">
                      {breakEvenData.fixedCosts.toLocaleString()}円
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* 比率情報 */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                粗利率
              </Typography>
              <Typography variant="h3" component="div" sx={{ my: 2 }}>
                {(Number(breakEvenData.grossMarginRate) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                粗利率が高いほど、損益分岐点売上高が低くなります
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                変動費率
              </Typography>
              <Typography variant="h3" component="div" sx={{ my: 2 }}>
                {(Number(breakEvenData.variableCostRate) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                変動費率 = 変動費 ÷ 売上高
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 達成率 */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                損益分岐点達成率
              </Typography>
              <Box display="flex" alignItems="center" gap={2} my={2}>
                <Box flex={1}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      Number(breakEvenData.achievementRate) * 100,
                      100,
                    )}
                    color={getStatusColor(breakEvenData.status)}
                    sx={{ height: 20, borderRadius: 2 }}
                  />
                </Box>
                <Typography variant="h5" sx={{ minWidth: 100, textAlign: 'right' }}>
                  {(Number(breakEvenData.achievementRate) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Alert severity={breakEvenData.status === 'safe' ? 'success' : breakEvenData.status === 'warning' ? 'warning' : 'error'}>
                {breakEvenData.status === 'safe' &&
                  '損益分岐点を大きく上回っています。財務状況は良好です。'}
                {breakEvenData.status === 'warning' &&
                  '損益分岐点を上回っていますが、余裕は少ないです。'}
                {breakEvenData.status === 'danger' &&
                  '損益分岐点を下回っています。売上の改善が必要です。'}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
