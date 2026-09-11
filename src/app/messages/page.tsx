'use client';

import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

export default function MessagesPage() {
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
          Messages
        </Typography>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Welcome to your inbox!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto', mb: 3 }}>
          Drop a line, share posts and more with private conversations between you and others on X.
        </Typography>
        <Button variant="contained" color="primary" sx={{ px: 3, py: 1.2, fontWeight: 700 }}>
          Write a message
        </Button>
      </Box>
    </AppLayout>
  );
}
