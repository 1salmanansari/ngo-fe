import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#1556A3',
        light: '#2574d4',
        dark: '#0c3d77',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#198847',
        light: '#28a745',
        dark: '#116130',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0b1320' : '#f4f6fa',
        paper: isDark ? '#111c2e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
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
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 600,
        fontSize: '0.8125rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(15, 23, 42, 0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: isDark ? '#94a3b8' : '#475569',
              backgroundColor: isDark ? '#142237' : '#f8fafc',
              borderBottom: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(0,0,0,0.06)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : '1px solid rgba(0, 0, 0, 0.05)',
            fontSize: '0.875rem',
            padding: '12px 16px',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.75rem',
            padding: '6px 10px',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
