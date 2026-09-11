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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import AppLayout from '@/components/layout/AppLayout';

export default function ProfilePage() {
  const [tab, setTab] = React.useState(0);

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
          gap: 3,
        }}
      >
        <IconButton sx={{ color: 'text.primary' }} href="/">
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Alex Dev
            </Typography>
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            142 Posts
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
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            alt="Alex Dev"
            sx={{
              width: 134,
              height: 134,
              border: '4px solid #000000',
            }}
          />
          <Button variant="outlined" sx={{ fontWeight: 700, px: 2.5 }}>
            Edit profile
          </Button>
        </Box>

        {/* Bio & Details */}
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Alex Dev
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          @alex_builder
        </Typography>

        <Typography variant="body1" sx={{ mb: 1.5 }}>
          Building high-performance web applications with Next.js 16 & Material UI. Design systems and UI/UX engineering enthusiast.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', mb: 1.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">Joined March 2021</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>540</Box> Following
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>12.4K</Box> Followers
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
        <Tab label="Posts" />
        <Tab label="Replies" />
        <Tab label="Highlights" />
        <Tab label="Media" />
        <Tab label="Likes" />
      </Tabs>
    </AppLayout>
  );
}
