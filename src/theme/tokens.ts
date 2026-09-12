/**
 * Design Tokens for Twitter / X Web App
 * Generated according to UI/UX Pro Max rules:
 * - 4/8dp spacing rhythm
 * - AAA/AA 4.5:1 text contrast compliance
 * - Consistent icon sizes and touch target minimums (>= 44px)
 */

export const spacingTokens = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const iconSizes = {
  sm: 18,
  md: 22,
  lg: 26,
  xl: 30,
} as const;

export const touchTarget = {
  minWidth: 44,
  minHeight: 44,
} as const;

export const paletteTokens = {
  brand: {
    primary: '#1d9bf0',
    primaryHover: '#1a8cd8',
    primarySubtle: 'rgba(29, 155, 240, 0.1)',
    like: '#f91880',
    likeSubtle: 'rgba(249, 24, 128, 0.1)',
    repost: '#00ba7c',
    repostSubtle: 'rgba(0, 186, 124, 0.1)',
  },
  dark: {
    background: '#000000',
    surface: '#16181c',
    surfaceHover: '#1d1f23',
    border: '#2f3336',
    borderSubtle: '#202327',
    textPrimary: '#e7e9ea',
    textSecondary: '#71767b',
    actionHover: 'rgba(239, 243, 244, 0.1)',
    inputBackground: '#202327',
  },
  light: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceHover: '#f7f9f9',
    border: '#eff3f4',
    borderSubtle: '#e1e8ed',
    textPrimary: '#0f1419',
    textSecondary: '#536471',
    actionHover: 'rgba(15, 20, 25, 0.05)',
    inputBackground: '#f7f9f9',
  },
} as const;
