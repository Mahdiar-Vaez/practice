'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { paletteTokens, spacingTokens } from './tokens';

export function getTwitterTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  const colors = isDark ? paletteTokens.dark : paletteTokens.light;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      primary: {
        main: paletteTokens.brand.primary,
        light: paletteTokens.brand.primaryHover,
        dark: paletteTokens.brand.primaryHover,
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#eff3f4' : '#0f1419',
        contrastText: isDark ? '#0f1419' : '#ffffff',
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
      error: {
        main: '#f4212e',
      },
      success: {
        main: '#00ba7c',
      },
      action: {
        hover: colors.actionHover,
        selected: isDark ? 'rgba(239, 243, 244, 0.15)' : 'rgba(15, 20, 25, 0.15)',
      },
    },
    spacing: 8, // 8px base spacing unit: theme.spacing(1) = 8px, theme.spacing(0.5) = 4px
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 800, fontSize: '2rem' },
      h2: { fontWeight: 700, fontSize: '1.5rem' },
      h3: { fontWeight: 700, fontSize: '1.25rem' },
      h4: { fontWeight: 700, fontSize: '1.125rem' },
      h5: { fontWeight: 700, fontSize: '1rem' },
      h6: { fontWeight: 700, fontSize: '0.9375rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.4 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.35 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            '--space-0': spacingTokens[0],
            '--space-1': spacingTokens[1],
            '--space-2': spacingTokens[2],
            '--space-3': spacingTokens[3],
            '--space-4': spacingTokens[4],
            '--space-5': spacingTokens[5],
            '--space-6': spacingTokens[6],
            '--space-8': spacingTokens[8],
            '--space-10': spacingTokens[10],
            '--space-12': spacingTokens[12],
            '--space-16': spacingTokens[16],
            '--sab': 'env(safe-area-inset-bottom, 0px)',
            '--sat': 'env(safe-area-inset-top, 0px)',
          },
          body: {
            backgroundColor: colors.background,
            color: colors.textPrimary,
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: `${colors.border} ${colors.background}`,
            WebkitTapHighlightColor: 'transparent',
          },
          '::-webkit-scrollbar': {
            width: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: colors.background,
          },
          '::-webkit-scrollbar-thumb': {
            background: colors.border,
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: colors.textSecondary,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 9999,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            boxShadow: 'none',
            minHeight: 44, // Minimum 44px touch target per UI/UX Pro Max
            paddingLeft: '16px',
            paddingRight: '16px',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            backgroundColor: paletteTokens.brand.primary,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: paletteTokens.brand.primaryHover,
            },
          },
          containedSecondary: {
            backgroundColor: isDark ? '#eff3f4' : '#0f1419',
            color: isDark ? '#0f1419' : '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#d7dbdc' : '#272c30',
            },
          },
          outlined: {
            borderColor: isDark ? '#536471' : '#cfd9de',
            color: colors.textPrimary,
            '&:hover': {
              borderColor: isDark ? '#677b8b' : '#8b98a5',
              backgroundColor: colors.actionHover,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '50%',
            padding: '8px',
            minWidth: 44, // Minimum 44px touch target per UI/UX Pro Max
            minHeight: 44,
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            '&:hover': {
              backgroundColor: colors.actionHover,
            },
            '&:active': {
              transform: 'scale(0.96)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.border}`,
            minHeight: '53px',
          },
          indicator: {
            height: '4px',
            borderRadius: '4px',
            backgroundColor: paletteTokens.brand.primary,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            color: colors.textSecondary,
            minHeight: '53px',
            minWidth: 44,
            transition: 'background-color 0.2s ease, color 0.2s ease',
            '&:hover': {
              backgroundColor: colors.actionHover,
            },
            '&.Mui-selected': {
              color: colors.textPrimary,
              fontWeight: 800,
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}

const defaultTheme = getTwitterTheme('dark');
export default defaultTheme;
