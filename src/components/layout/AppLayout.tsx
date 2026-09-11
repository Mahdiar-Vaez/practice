'use client';

import * as React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import RightWidgets from './RightWidgets';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobilePostFab from './MobilePostFab';
import AuthGuard from '@/components/auth/AuthGuard';

interface AppLayoutProps {
  children: React.ReactNode;
  onFabClick?: () => void;
}

export default function AppLayout({ children, onFabClick }: AppLayoutProps) {
  return (
    <AuthGuard>
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>

      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'center',
          maxWidth: { xs: '100%', sm: '100%', md: '1050px', lg: '1280px' },
          minHeight: '100vh',
        }}
      >
        {/* Left Navigation Sidebar (Visible on sm/md/lg, hidden on xs) */}
        <Sidebar />

        {/* Center Main Content (Feed or Subpage) */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: { xs: '100%', sm: 600 },
            minHeight: '100vh',
            borderInlineEnd: { xs: 'none', sm: '1px solid' },
            borderInlineStart: { xs: 'none', lg: '1px solid' },
            borderColor: 'divider',
            position: 'relative',
            // Ensure content clearance for mobile fixed bottom bar
            pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', sm: 4 },
          }}
        >
          {/* Mobile Top Header */}
          <MobileHeader />

          {/* Page Content */}
          {children}

          {/* Mobile Floating Action Button */}
          <MobilePostFab onClick={onFabClick} />
        </Box>

        {/* Right Sidebar Widgets (Visible on lg/xl, hidden on xs/sm/md) */}
        <RightWidgets />
      </Container>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />
    </Box>
    </AuthGuard>
  );
}

