'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MailIcon from '@mui/icons-material/Mail';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useColorMode } from '@/theme/ThemeRegistry';

const MOBILE_NAV_ITEMS = [
  { label: 'خانه', href: '/', icon: HomeOutlinedIcon, activeIcon: HomeIcon },
  { label: 'کاوش', href: '/explore', icon: SearchIcon, activeIcon: SearchIcon, isSearch: true },
  { label: 'اعلان‌ها', href: '/notifications', icon: NotificationsOutlinedIcon, activeIcon: NotificationsIcon },
  { label: 'پیام‌ها', href: '/messages', icon: MailOutlineIcon, activeIcon: MailIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { mode } = useColorMode();

  return (
    <Box
      component="nav"
      aria-label="Mobile Navigation"
      sx={{
        display: { xs: 'flex', sm: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(53px + env(safe-area-inset-bottom, 0px))',
        pb: 'env(safe-area-inset-bottom, 0px)',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 1100,
        px: 1,
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = isActive ? item.activeIcon : item.icon;

        return (
          <IconButton
            key={item.label}
            component={Link}
            href={item.href}
            aria-label={item.label}
            sx={{
              width: 48,
              height: 48,
              minWidth: 44,
              minHeight: 44,
              color: 'text.primary',
              transition: 'transform 0.15s ease',
              '&:active': {
                transform: 'scale(0.92)',
              },
            }}
          >
            <IconComponent
              sx={{
                fontSize: 28,
                ...(item.isSearch && isActive && {
                  stroke: 'currentColor',
                  strokeWidth: 1.6,
                }),
              }}
            />
          </IconButton>
        );
      })}
    </Box>
  );
}
