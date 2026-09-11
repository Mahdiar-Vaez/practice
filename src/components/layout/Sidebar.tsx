'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Avatar,
  Stack,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MailIcon from '@mui/icons-material/Mail';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CreateIcon from '@mui/icons-material/Create';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from '@/theme/ThemeRegistry';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { label: 'خانه', href: '/', icon: HomeOutlinedIcon, activeIcon: HomeIcon },
  { label: 'کاوش', href: '/explore', icon: SearchIcon, activeIcon: SearchIcon, isSearch: true },
  { label: 'اعلان‌ها', href: '/notifications', icon: NotificationsOutlinedIcon, activeIcon: NotificationsIcon },
  { label: 'پیام‌ها', href: '/messages', icon: MailOutlineIcon, activeIcon: MailIcon },
  { label: 'نشانک‌ها', href: '/bookmarks', icon: BookmarkBorderIcon, activeIcon: BookmarkIcon },
  { label: 'پروفایل', href: '/profile', icon: PersonOutlineIcon, activeIcon: PersonIcon },
  { label: 'ورود به حساب', href: '/login', icon: LoginIcon, activeIcon: LoginIcon, authOnly: 'guest' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isLarge = useMediaQuery('(min-width:1280px)');
  const { mode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box
      component="header"
      sx={{
        width: isLarge ? 240 : 80,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: { xs: 'none', sm: 'flex' }, // Hidden on mobile xs, mobile uses bottom nav + top bar
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isLarge ? '12px 12px' : '12px 8px',
        borderInlineEnd: '1px solid',
        borderColor: 'divider',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Twitter / X Logo */}
        <Box sx={{ px: 1, py: 0.5, mb: 0.5 }}>
          <IconButton
            component={Link}
            href="/"
            sx={{
              width: 50,
              height: 50,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label="X Logo"
          >
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </IconButton>
        </Box>

        {/* Navigation Items */}
        <Stack spacing={0.5} component="nav">
          {NAV_ITEMS.map((item) => {
            if (item.authOnly === 'guest' && isAuthenticated) return null;
            const isActive = pathname === item.href;
            const IconComponent = isActive ? item.activeIcon : item.icon;

            return (
              <Box
                key={item.label}
                component={Link}
                href={item.href}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'text.primary',
                  borderRadius: 9999,
                  p: isLarge ? '10px 16px' : '10px',
                  width: isLarge ? 'fit-content' : 50,
                  height: 50,
                  mx: isLarge ? 0 : 'auto',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 26,
                    color: 'text.primary',
                    ...(item.isSearch && isActive && {
                      stroke: 'currentColor',
                      strokeWidth: 1.5,
                    }),
                  }}
                />
                {isLarge && (
                  <Typography
                    variant="body1"
                    sx={{
                      ml: 2,
                      fontWeight: isActive ? 800 : 400,
                      fontSize: '1.1rem',
                      lineHeight: 1,
                      color: 'text.primary',
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            );
          })}

          {/* Theme Light / Dark Toggle Item */}
          <Box
            onClick={toggleColorMode}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'text.primary',
              borderRadius: 9999,
              p: isLarge ? '10px 16px' : '10px',
              width: isLarge ? 'fit-content' : 50,
              height: 50,
              mx: isLarge ? 0 : 'auto',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {mode === 'dark' ? (
              <LightModeOutlinedIcon sx={{ fontSize: 26, color: 'text.primary' }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ fontSize: 26, color: 'text.primary' }} />
            )}
            {isLarge && (
              <Typography
                variant="body1"
                sx={{
                  ml: 2,
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  color: 'text.primary',
                }}
              >
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Primary Action Button ("Post") */}
        <Box sx={{ mt: 2, width: '100%' }}>
          {isLarge ? (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                py: 1.25,
                fontSize: '1rem',
                fontWeight: 800,
              }}
            >
              ارسال پست
            </Button>
          ) : (
            <Tooltip title="ارسال پست">
              <IconButton
                sx={{
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  display: 'flex',
                  backgroundColor: 'primary.main',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
                aria-label="New Post"
              >
                <CreateIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* User Account Profile Pill / Login CTA */}
      {isAuthenticated && user ? (
        <>
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isLarge ? 'space-between' : 'center',
              p: isLarge ? '10px 12px' : '6px',
              borderRadius: 9999,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                alt={user.name}
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                sx={{ width: 40, height: 40 }}
              />
              {isLarge && (
                <Box sx={{ minWidth: 0, textAlign: 'right' }}>
                  <Typography
                    variant="body1"
                    noWrap
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ color: 'text.secondary', lineHeight: 1.2 }}
                  >
                    @{user.username}
                  </Typography>
                </Box>
              )}
            </Stack>
            {isLarge && (
              <MoreHorizIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            )}
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 3,
                minWidth: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
              }}
              sx={{ color: 'error.main', fontWeight: 600, gap: 1 }}
            >
              <LogoutIcon fontSize="small" />
              خروج از حساب (@{user.username})
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ p: isLarge ? 1 : 0 }}>
          {isLarge ? (
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              fullWidth
              startIcon={<LoginIcon />}
              sx={{
                borderRadius: 9999,
                fontWeight: 700,
                py: 1,
              }}
            >
              ورود به حساب
            </Button>
          ) : (
            <Tooltip title="ورود به حساب">
              <IconButton
                component={Link}
                href="/login"
                sx={{
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <LoginIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}
