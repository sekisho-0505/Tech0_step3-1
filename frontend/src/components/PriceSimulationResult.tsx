'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useSimulationStore } from '@/stores/simulationStore';

const formatCurrency = (value: number) => `${value.toLocaleString()}円/kg`;

export const PriceSimulationResult = () => {
  const { result } = useSimulationStore();

  if (!result) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            シミュレーション結果
          </Typography>
          <Typography color="text.secondary">
            左のフォームに条件を入力して「計算を実行」を押すと結果が表示されます。
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          シミュレーション結果
        </Typography>

        <Alert severity={result.guard.is_below_min ? 'error' : 'success'} sx={{ mb: 3 }}>
          {result.guard.message}（最低価格: {result.guard.minimum_price_per_kg.toLocaleString()}円/kg）
        </Alert>

        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Chip label={`推奨価格: ${result.recommended_price_per_kg.toLocaleString()}円/kg`} color="primary" size="medium" sx={{ fontSize: '1.2rem', py: 2 }} />
          <Chip label={`粗利益: ${result.gross_profit_per_kg.toLocaleString()}円/kg`} />
          <Chip label={`粗利率: ${(result.margin_rate * 100).toFixed(1)}%`} />
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          価格パターン
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>粗利率</TableCell>
              <TableCell align="right">販売価格</TableCell>
              <TableCell align="right">粗利益</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.price_patterns.map((pattern) => {
              const isSelected = Math.abs(pattern.margin_rate - result.margin_rate) < 0.0001;
              return (
                <TableRow key={pattern.margin_rate} selected={isSelected}>
                  <TableCell>{(pattern.margin_rate * 100).toFixed(0)}%</TableCell>
                  <TableCell align="right">{formatCurrency(pattern.price_per_kg)}</TableCell>
                  <TableCell align="right">{`${pattern.profit_per_kg.toLocaleString()}円/kg`}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Button
          variant="contained"
          color={result.guard.is_below_min ? 'error' : 'primary'}
          disabled={result.guard.is_below_min}
          fullWidth
          sx={{ mt: 3 }}
        >
          {result.guard.is_below_min
            ? '最低売価を下回るため保存できません'
            : 'この条件で保存'}
        </Button>
      </CardContent>
    </Card>
  );
};
