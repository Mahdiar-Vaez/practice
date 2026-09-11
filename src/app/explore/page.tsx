'use client';

import * as React from 'react';
import { Box, Typography, Tabs, Tab, Stack } from '@mui/material';
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
          <Tab label="For you" />
          <Tab label="Trending" />
          <Tab label="News" />
          <Tab label="Sports" />
          <Tab label="Entertainment" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Explore & Trending
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Real-time trends, topics, and discussions tailored for you.
        </Typography>
      </Box>
    </AppLayout>
  );
}
