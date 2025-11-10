'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { importExcel } from '@/services/importService';
import type { ImportResponse } from '@/types/import';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const importResult = await importExcel(file);
      setResult(importResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'インポートに失敗しました',
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* ヘッダー */}
      <Typography variant="h4" component="h1" gutterBottom>
        データインポート
      </Typography>

      {/* ナビゲーション */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button component={Link} href="/" variant="outlined">
          価格シミュレーション
        </Button>
        <Button component={Link} href="/dashboard" variant="outlined">
          ダッシュボード
        </Button>
        <Button component={Link} href="/import" variant="contained">
          インポート
        </Button>
      </Box>

      {/* ファイルアップロード */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Excelファイルアップロード
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ファイル選択
              </Typography>
              <Button variant="outlined" component="label" fullWidth>
                ファイルを選択
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                対応形式: .xlsx, .xls (最大10MB)
              </Typography>
            </Box>

            {file && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>選択されたファイル</AlertTitle>
                <Typography variant="body2">
                  ファイル名: <strong>{file.name}</strong>
                </Typography>
                <Typography variant="body2">
                  サイズ: {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={!file || loading}
              fullWidth
              size="large"
            >
              {loading ? 'インポート中...' : 'インポート開始'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <AlertTitle>エラー</AlertTitle>
          {error}
        </Alert>
      )}

      {/* 結果表示 */}
      {result && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* サマリー */}
          <Alert
            severity={result.success ? 'success' : 'warning'}
            icon={<CheckCircleIcon />}
          >
            <AlertTitle>
              インポート{result.success ? '完了' : '完了（一部エラー）'}
            </AlertTitle>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid xs={4}>
                <Typography variant="body2" color="text.secondary">
                  成功
                </Typography>
                <Typography variant="h5" color="success.main">
                  {result.imported}
                </Typography>
              </Grid>
              <Grid xs={4}>
                <Typography variant="body2" color="text.secondary">
                  スキップ
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  {result.skipped}
                </Typography>
              </Grid>
              <Grid xs={4}>
                <Typography variant="body2" color="text.secondary">
                  エラー
                </Typography>
                <Typography variant="h5" color="error.main">
                  {result.errors.length}
                </Typography>
              </Grid>
            </Grid>
          </Alert>

          {/* エラー詳細 */}
          {result.errors.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  エラー詳細
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>行</TableCell>
                        <TableCell>列</TableCell>
                        <TableCell>値</TableCell>
                        <TableCell>理由</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.errors.map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{err.row}</TableCell>
                          <TableCell>{err.column}</TableCell>
                          <TableCell>{String(err.value)}</TableCell>
                          <TableCell>{err.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* 警告 */}
          {result.warnings.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  警告
                </Typography>
                <List>
                  {result.warnings.map((warning, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`行 ${warning.row}: ${warning.message}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Container>
  );
}
