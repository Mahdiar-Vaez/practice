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
          top: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Notifications
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_e, val) => setTab(val)} variant="fullWidth">
          <Tab label="All" />
          <Tab label="Verified" />
          <Tab label="Mentions" />
        </Tabs>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Nothing to see here — yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mx: 'auto' }}>
          From likes to reposts and a whole lot more, this is where all the action about your posts and account will appear.
        </Typography>
      </Box>
    </AppLayout>
  );
}
