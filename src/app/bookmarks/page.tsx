'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

export default function BookmarksPage() {
  return (
    <AppLayout>
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
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Bookmarks
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          @alex_builder
        </Typography>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Save posts for later
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mx: 'auto' }}>
          Don&apos;t let the good ones fly away! Bookmark posts to easily find them again in the future.
        </Typography>
      </Box>
    </AppLayout>
  );
}
