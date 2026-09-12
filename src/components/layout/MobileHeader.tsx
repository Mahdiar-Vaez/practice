'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Avatar,
  IconButton,
} from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useColorMode } from '@/theme/ThemeRegistry';
import { useAuth } from '@/hooks/useAuth';
import MobileDrawer from './MobileDrawer';

export default function MobileHeader() {
  const { mode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <>
      <Box
        component="nav"
        sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          height: 53,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : '#ffffff',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Avatar trigger for drawer */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ p: 0.5, width: 44, height: 44 }}
          aria-label="باز کردن منوی کاربری"
        >
          <Avatar
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user?.name || 'کاربر'}
            sx={{ width: 34, height: 34 }}
          />
        </IconButton>

        {/* Center: Brand X Logo */}
        <IconButton
          component={Link}
          href="/"
          sx={{
            width: 44,
            height: 44,
            color: 'text.primary',
          }}
          aria-label="Home"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </IconButton>

        {/* Right: Theme Mode Switcher */}
        <IconButton
          onClick={toggleColorMode}
          sx={{ width: 44, height: 44, color: 'text.primary' }}
          aria-label={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {mode === 'dark' ? (
            <LightModeOutlinedIcon sx={{ fontSize: 22 }} />
          ) : (
            <DarkModeOutlinedIcon sx={{ fontSize: 22 }} />
          )}
        </IconButton>
      </Box>

      {/* Slide Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
