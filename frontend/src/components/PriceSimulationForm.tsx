'use client';

import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Slider from '@mui/material/Slider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';

import { fetchPriceSimulation } from '@/services/priceSimulationService';
import {
  PriceSimulationFormValues,
  priceSimulationSchema,
} from '@/lib/validation';
import { useSimulationStore } from '@/stores/simulationStore';

const productOptions = [
  '商品A',
  '商品B',
  '商品C',
  '商品D',
  '商品E',
];

const marginMarks = [
  { value: 0, label: '0%' },
  { value: 30, label: '30%' },
  { value: 60, label: '60%' },
  { value: 90, label: '90%' },
];

export const PriceSimulationForm = () => {
  const { setInput, setLoading, setResult, setError, loading, error } = useSimulationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PriceSimulationFormValues>({
    mode: 'onChange',
    resolver: zodResolver(priceSimulationSchema),
    defaultValues: {
      productName: '',
      unitCostPerKg: 1000,
      targetMarginRate: 30,
      quantityKg: undefined,
    },
  });

  const onSubmit = useCallback(
    async (values: PriceSimulationFormValues) => {
      setLoading(true);
      setError(undefined);
      try {
        // 入力値を保存
        setInput({
          productName: values.productName,
          unitCostPerKg: values.unitCostPerKg,
          targetMarginRate: values.targetMarginRate / 100,
          quantityKg: values.quantityKg ?? undefined,
        });

        const response = await fetchPriceSimulation({
          productName: values.productName,
          unitCostPerKg: values.unitCostPerKg,
          targetMarginRate: values.targetMarginRate / 100,
          quantityKg: values.quantityKg ?? undefined,
        });
        setResult(response);
      } catch (apiError) {
        setResult(undefined);
        setError(
          apiError instanceof Error
            ? apiError.message
            : 'シミュレーションに失敗しました',
        );
      } finally {
        setLoading(false);
      }
    },
    [setInput, setError, setLoading, setResult],
  );

  const handleCloseError = useCallback(() => setError(undefined), [setError]);

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 3 }}>
        <Typography variant="h5">価格シミュレーション条件</Typography>

        <Controller
          name="productName"
          control={control}
          render={({ field }) => (
            <Autocomplete
              freeSolo
              options={productOptions}
              onInputChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="商品名"
                  required
                  error={Boolean(errors.productName)}
                  helperText={errors.productName?.message}
                />
              )}
              value={field.value}
            />
          )}
        />

        <Controller
          name="unitCostPerKg"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="原価（円/kg）"
              type="number"
              required
              inputProps={{ min: 0, step: 1 }}
              error={Boolean(errors.unitCostPerKg)}
              helperText={
                errors.unitCostPerKg?.message ?? '千円単位ではなく円単位で入力してください'
              }
              onChange={(event) => field.onChange(Number(event.target.value))}
              onFocus={(event) => event.target.select()}
            />
          )}
        />

        <Controller
          name="targetMarginRate"
          control={control}
          render={({ field }) => (
            <Box>
              <Typography gutterBottom>目標粗利率（%）</Typography>
              <TextField
                fullWidth
                type="number"
                value={field.value}
                inputProps={{ min: 0, max: 90, step: 1 }}
                sx={{ mb: 1 }}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (value >= 0 && value <= 90) {
                    field.onChange(value);
                  }
                }}
                onFocus={(event) => event.target.select()}
                error={Boolean(errors.targetMarginRate)}
                helperText={errors.targetMarginRate?.message ?? '0〜90の範囲で入力できます'}
              />
              <Slider
                value={field.value}
                step={5}
                min={0}
                max={90}
                marks={marginMarks}
                onChange={(_, value) => field.onChange(value as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
          )}
        />

        <Controller
          name="quantityKg"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="数量（kg）"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              error={Boolean(errors.quantityKg)}
              helperText={errors.quantityKg?.message ?? '任意項目です'}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(value === '' ? undefined : Number(value));
              }}
              onFocus={(event) => event.target.select()}
            />
          )}
        />

        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : '計算を実行'}
        </Button>
      </Box>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
