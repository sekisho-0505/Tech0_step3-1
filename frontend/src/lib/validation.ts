import { z } from 'zod';

export const priceSimulationSchema = z.object({
  productName: z.string().min(1, '商品名を入力してください'),
  unitCostPerKg: z.coerce
    .number({ invalid_type_error: '原価を数値で入力してください' })
    .positive('原価は0より大きい値を入力してください'),
  targetMarginRate: z
    .number({ invalid_type_error: '目標粗利率を入力してください' })
    .min(0, '粗利率は0%以上に設定してください')
    .max(90, '粗利率は90%以下に設定してください'),
  quantityKg: z
    .union([
      z.coerce
        .number({ invalid_type_error: '数量は数値で入力してください' })
        .min(0, '数量は0以上で入力してください'),
      z.undefined(),
    ])
    .optional(),
});

export type PriceSimulationFormValues = z.infer<typeof priceSimulationSchema>;
