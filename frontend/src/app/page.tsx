import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { PriceSimulationForm } from '@/components/PriceSimulationForm';
import { PriceSimulationResult } from '@/components/PriceSimulationResult';

export default function HomePage() {
  return (
    <main>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1">
            価格設定支援システム
          </Typography>
          <Typography color="text.secondary">
            商品の原価と目標粗利率を入力すると、推奨される販売価格と粗利パターンを算出します。最低売価ガードでリスクを未然に防ぎましょう。
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          <Grid xs={12} md={6}>
            <PriceSimulationForm />
          </Grid>
          <Grid xs={12} md={6}>
            <PriceSimulationResult />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
