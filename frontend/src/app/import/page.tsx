'use client';

import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}

export default function ImportPage() {
  // Monthly revenue state
  const [yearMonth, setYearMonth] = useState('');
  const [totalRevenue, setTotalRevenue] = useState('');
  const [notes, setNotes] = useState('');
  const [revenueLoading, setRevenueLoading] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info') => {
      setNotification({ open: true, message, severity });
    },
    []
  );

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Monthly revenue handlers
  const handleRevenueSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!yearMonth || !totalRevenue) {
        showNotification('年月と総売上高を入力してください', 'error');
        return;
      }

      setRevenueLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/data-import/monthly-revenue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            year_month: yearMonth,
            total_revenue: totalRevenue,
            ...(notes && { notes }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail?.error?.message || '月次売上高の保存に失敗しました');
        }

        const data = await response.json();
        showNotification(data.message || '月次売上高を保存しました', 'success');

        // Reset form
        setTotalRevenue('');
        setNotes('');
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : '月次売上高の保存に失敗しました',
          'error'
        );
      } finally {
        setRevenueLoading(false);
      }
    },
    [yearMonth, totalRevenue, notes, showNotification]
  );

  // File upload handlers
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) {
      showNotification('ファイルを選択してください', 'error');
      return;
    }

    setFileLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('import_type', 'products');

      const response = await fetch(`${API_BASE_URL}/api/v1/data-import/excel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.error?.message || 'インポートに失敗しました');
      }

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.success) {
        showNotification(
          `インポート完了: ${result.imported}件成功, ${result.skipped}件スキップ`,
          result.skipped > 0 ? 'info' : 'success'
        );
      }
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'インポートに失敗しました',
        'error'
      );
    } finally {
      setFileLoading(false);
    }
  }, [selectedFile, showNotification]);

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          データインポート
        </Typography>

        {/* Monthly Revenue Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              月次総売上高の登録
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              月ごとの総売上高を入力してください。既存のデータがある場合は更新されます。
            </Typography>

            <Box
              component="form"
              onSubmit={handleRevenueSubmit}
              sx={{ display: 'grid', gap: 2 }}
            >
              <TextField
                label="対象年月"
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                helperText="YYYY-MM形式で指定してください"
              />

              <TextField
                label="総売上高（円）"
                type="number"
                value={totalRevenue}
                onChange={(e) => setTotalRevenue(e.target.value)}
                required
                inputProps={{ min: 0, step: 1 }}
                helperText="月の総売上高を入力してください"
                onFocus={(e) => e.target.select()}
              />

              <TextField
                label="備考"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                helperText="任意項目です"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={revenueLoading}
                sx={{ alignSelf: 'flex-start' }}
              >
                {revenueLoading ? <CircularProgress size={24} /> : '保存'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        {/* Excel Import Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              商品データのインポート
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Excelファイルから商品データをインポートします。ファイルには「商品コード」「商品名」「原価」「単価」のカラムが必要です。
            </Typography>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={fileLoading}
                >
                  ファイルを選択
                  <VisuallyHiddenInput
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    選択: {selectedFile.name}
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={!selectedFile || fileLoading}
                onClick={handleFileUpload}
                sx={{ alignSelf: 'flex-start' }}
              >
                {fileLoading ? <CircularProgress size={24} /> : 'インポート実行'}
              </Button>

              {/* Import Results */}
              {importResult && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity={
                      importResult.errors.length > 0
                        ? 'warning'
                        : 'success'
                    }
                  >
                    <Typography variant="body2">
                      <strong>インポート結果:</strong>
                    </Typography>
                    <Typography variant="body2">
                      成功: {importResult.imported}件
                    </Typography>
                    <Typography variant="body2">
                      スキップ: {importResult.skipped}件
                    </Typography>
                  </Alert>

                  {importResult.errors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        エラー詳細:
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {importResult.errors.map((error, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            color="error"
                            sx={{ fontSize: '0.875rem' }}
                          >
                            行{error.row}: {error.reason}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
