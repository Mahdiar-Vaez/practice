'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function BookmarksPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <Box
        sx={{
          position: 'sticky',
          top: { xs: 53, sm: 0 },
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          نشانک‌ها
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {user ? `@${user.username}` : '@demo'}
        </Typography>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
          ذخیره پست‌ها برای بعد
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto', lineHeight: 1.6 }}>
          پست‌های جالب و کاربردی را ذخیره کنید تا در آینده در هر زمان بتوانید مجدداً به آن‌ها دسترسی پیدا کنید.
        </Typography>
      </Box>
    </AppLayout>
  );
}
