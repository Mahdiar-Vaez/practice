'use client';

import * as React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

export default function ExplorePage() {
  const [tab, setTab] = React.useState(0);

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
        }}
      >
        <Tabs
          value={tab}
          onChange={(_e, val) => setTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="برای شما" />
          <Tab label="ترندهای داغ" />
          <Tab label="اخبار" />
          <Tab label="ورزش" />
          <Tab label="سرگرمی" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          کاوش و موضوعات داغ
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          آخرین اخبار، گفت‌وگوهای زنده و موضوعات پرطرفدار شخصی‌سازی‌شده برای شما.
        </Typography>
      </Box>
    </AppLayout>
  );
}
