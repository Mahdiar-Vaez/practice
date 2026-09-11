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
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useColorMode } from '@/theme/ThemeRegistry';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Drawer
      anchor="left"
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
          Account Info
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.primary' }} aria-label="Close menu">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Info */}
      <Box sx={{ mb: 2 }}>
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
          alt="Alex Dev"
          sx={{ width: 48, height: 48, mb: 1 }}
        />
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          Alex Dev
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          @alex_builder
        </Typography>

        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>540</Box> Following
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>12.4K</Box> Followers
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Menu Navigation */}
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/profile" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} href="/premium" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <VerifiedOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Premium" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} href="/bookmarks" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <BookmarkBorderIcon />
            </ListItemIcon>
            <ListItemText primary="Bookmarks" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} href="/communities" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <PeopleOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Communities" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Settings and privacy" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} href="/login" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Sign in" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 1.5 }} />

      {/* Theme Switcher in Drawer */}
      <ListItem disablePadding>
        <ListItemButton onClick={toggleColorMode} sx={{ borderRadius: 2, py: 1 }}>
          <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </ListItemIcon>
          <ListItemText
            primary={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            primaryTypographyProps={{ fontWeight: 700 }}
          />
        </ListItemButton>
      </ListItem>
    </Drawer>
  );
}
