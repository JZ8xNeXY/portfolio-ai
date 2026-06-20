'use client';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, fontWeight: 600 }}>
          PortfolioAI
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<DashboardIcon />}
            color="inherit"
            sx={{
              borderBottom: pathname === '/' ? '2px solid' : 'none',
              borderColor: 'primary.main',
              borderRadius: 0,
              px: 2,
            }}
          >
            ダッシュボード
          </Button>

          <Button
            component={Link}
            href="/upload"
            startIcon={<CloudUploadIcon />}
            color="inherit"
            sx={{
              borderBottom: pathname === '/upload' ? '2px solid' : 'none',
              borderColor: 'primary.main',
              borderRadius: 0,
              px: 2,
            }}
          >
            データ取込
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          {new Date().toLocaleDateString('ja-JP')}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
