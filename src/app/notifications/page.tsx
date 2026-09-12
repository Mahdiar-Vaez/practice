'use client';

import * as React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

export default function NotificationsPage() {
  const [tab, setTab] = React.useState(0);

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
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            اعلان‌ها
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_e, val) => setTab(val)} variant="fullWidth">
          <Tab label="همه" />
          <Tab label="تأییدشده" />
          <Tab label="اشاره‌ها (منشن)" />
        </Tabs>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          هنوز اعلانی دریافت نکرده‌اید!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto', lineHeight: 1.6 }}>
          تمام تعاملات کاربران مانند لایک‌ها، پاسخ‌ها، اشاره‌ها و بازنشر پست‌های شما در این بخش نمایش داده خواهند شد.
        </Typography>
      </Box>
    </AppLayout>
  );
}
