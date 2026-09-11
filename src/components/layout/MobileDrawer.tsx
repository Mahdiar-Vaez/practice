'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useColorMode } from '@/theme/ThemeRegistry';
import { useAuth } from '@/hooks/useAuth';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { mode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '280px',
          backgroundColor: 'background.default',
          color: 'text.primary',
          p: 2,
        },
      }}
    >
      {/* Header with Close */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          اطلاعات حساب
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.primary' }} aria-label="بستن منو">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Info */}
      {isAuthenticated && user ? (
        <Box sx={{ mb: 2 }}>
          <Avatar
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
            alt={user.name}
            sx={{ width: 48, height: 48, mb: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            @{user.username}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: 'action.hover' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            شما هنوز وارد حساب خود نشده‌اید.
          </Typography>
          <ListItemButton
            component={Link}
            href="/login"
            onClick={onClose}
            sx={{
              borderRadius: 8,
              backgroundColor: 'primary.main',
              color: '#ffffff',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <LoginIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>ورود به حساب</Typography>
          </ListItemButton>
        </Box>
      )}

      <Divider sx={{ my: 1.5 }} />

      {/* Menu Navigation */}
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/profile" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="پروفایل" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} href="/bookmarks" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <BookmarkBorderIcon />
            </ListItemIcon>
            <ListItemText primary="نشانک‌ها" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                logout();
                onClose();
              }}
              sx={{ borderRadius: 2, py: 1, color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="خروج از حساب" primaryTypographyProps={{ fontWeight: 700 }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ my: 1.5 }} />

      {/* Theme Switcher in Drawer */}
      <ListItem disablePadding>
        <ListItemButton onClick={toggleColorMode} sx={{ borderRadius: 2, py: 1 }}>
          <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </ListItemIcon>
          <ListItemText
            primary={mode === 'dark' ? 'حالت روشن' : 'حالت تیره'}
            primaryTypographyProps={{ fontWeight: 700 }}
          />
        </ListItemButton>
      </ListItem>
    </Drawer>
  );
}
