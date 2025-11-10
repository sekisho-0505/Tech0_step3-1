'use client';

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { fetchSimulationHistory, SimulationHistory } from '@/services/simulationHistoryService';

export default function SimulationHistoryPage() {
  const [history, setHistory] = useState<SimulationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchSimulationHistory();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          シミュレーション履歴
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          シミュレーション履歴
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'error' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        シミュレーション履歴
      </Typography>

      <Card>
        <CardContent>
          {history.length === 0 ? (
            <Alert severity="info">シミュレーション履歴がありません</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>実行日時</TableCell>
                  <TableCell>商品名</TableCell>
                  <TableCell align="right">原価（円/kg）</TableCell>
                  <TableCell align="right">目標粗利率</TableCell>
                  <TableCell align="right">推奨価格（円/kg）</TableCell>
                  <TableCell align="right">選択価格（円/kg）</TableCell>
                  <TableCell>ステータス</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      {new Date(item.simulation_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="right">{Number(item.input_cost_per_kg).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {(Number(item.target_margin_rate) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      {Number(item.calculated_price_per_kg).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {item.selected_price_per_kg
                        ? Number(item.selected_price_per_kg).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
