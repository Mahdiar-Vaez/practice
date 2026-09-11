'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTwitterTheme } from './theme';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

export const ColorModeContext = React.createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
  setColorMode: () => {},
});

export function useColorMode() {
  const context = React.useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within ThemeRegistry');
  }
  return context;
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ColorMode>('dark');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedMode = localStorage.getItem('twitter_color_mode') as ColorMode | null;
      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setMode(prefersDark ? 'dark' : 'light');
      }
    } catch {
      // fallback
    }
    setMounted(true);
  }, []);

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'dark' ? 'light' : 'dark';
          try {
            localStorage.setItem('twitter_color_mode', nextMode);
          } catch {}
          return nextMode;
        });
      },
      setColorMode: (newMode: ColorMode) => {
        setMode(newMode);
        try {
          localStorage.setItem('twitter_color_mode', newMode);
        } catch {}
      },
    }),
    [mode]
  );

  const theme = React.useMemo(() => getTwitterTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
