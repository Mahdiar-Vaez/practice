'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Stack,
  IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const [tab, setTab] = React.useState(0);
  const { user } = useAuth();

  const displayName = user?.name || 'کاربر دمو';
  const displayHandle = user ? `@${user.username}` : '@demo';
  const displayAvatar = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
  const displayBio = user?.bio || 'توسعه‌دهنده نرم‌افزار، علاقه‌مند به نکست‌جی‌اس ۱۶، متریال یو‌آی و معماری‌های مدرن وب.';

  return (
    <AppLayout>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton sx={{ color: 'text.primary' }} href="/">
          <ArrowForwardIcon />
        </IconButton>
        <Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {displayName}
            </Typography>
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ۱۴۲ پست
          </Typography>
        </Box>
      </Box>

      {/* Banner */}
      <Box
        sx={{
          height: 180,
          backgroundColor: '#333639',
          backgroundImage: 'linear-gradient(135deg, #1d9bf0 0%, #00ba7c 100%)',
        }}
      />

      {/* Avatar & Edit Profile Button */}
      <Box sx={{ px: 2, position: 'relative', pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mt: -8,
            mb: 2,
          }}
        >
          <Avatar
            src={displayAvatar}
            alt={displayName}
            sx={{
              width: 134,
              height: 134,
              border: '4px solid #000000',
            }}
          />
          <Button variant="outlined" sx={{ fontWeight: 700, px: 2.5, borderRadius: 9999 }}>
            ویرایش پروفایل
          </Button>
        </Box>

        {/* Bio & Details */}
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {displayName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {displayHandle}
        </Typography>

        <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }}>
          {displayBio}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', mb: 1.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">عضویت از فروردین ۱۴۰۳</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>۵۴۰</Box> دنبال‌شده
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>۱۲.۴K</Box> دنبال‌کننده
          </Typography>
        </Stack>
      </Box>

      {/* Profile Tabs */}
      <Tabs
        value={tab}
        onChange={(_e, val) => setTab(val)}
        variant="fullWidth"
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="پست‌ها" />
        <Tab label="پاسخ‌ها" />
        <Tab label="برگزیده‌ها" />
        <Tab label="رسانه‌ها" />
        <Tab label="پسندیده‌ها" />
      </Tabs>
    </AppLayout>
  );
}
