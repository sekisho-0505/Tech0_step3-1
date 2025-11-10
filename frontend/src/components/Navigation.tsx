'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: { label: string; path: Route; icon: ReactNode }[] = [
    { label: 'ダッシュボード', path: '/dashboard', icon: <DashboardIcon /> },
    { label: '価格シミュレーション', path: '/price-simulation', icon: <CalculateIcon /> },
    { label: '損益分岐点', path: '/break-even', icon: <TrendingUpIcon /> },
    { label: '履歴', path: '/history/simulations', icon: <HistoryIcon /> },
    { label: 'インポート', path: '/import', icon: <UploadFileIcon /> },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 4, cursor: 'pointer' }}
            onClick={() => router.push('/dashboard')}
          >
            価格設定支援システム
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => router.push(item.path)}
                sx={{
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
