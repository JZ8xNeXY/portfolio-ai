'use client';

import { createTheme } from '@mui/material/styles';

// CLAUDE.md で定義されたカラートークン
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4f8ef7', // アクセント
    },
    secondary: {
      main: '#f59e0b', // ゴールド
    },
    success: {
      main: '#10b981', // 上昇
    },
    error: {
      main: '#ef4444', // 下落
    },
    background: {
      default: '#0a0d14', // 背景
      paper: '#111827',   // サーフェス
    },
    divider: '#1f2d45', // ボーダー
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default darkTheme;
