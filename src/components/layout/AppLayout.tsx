'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import RightWidgets from './RightWidgets';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobilePostFab from './MobilePostFab';
import AuthGuard from '@/components/auth/AuthGuard';

interface AppLayoutProps {
  children: React.ReactNode;
  onFabClick?: () => void;
  fullWidth?: boolean;
}

export default function AppLayout({ children, onFabClick, fullWidth }: AppLayoutProps) {
  const pathname = usePathname();
  const isMessages = pathname === '/messages' || fullWidth;

  return (
    <AuthGuard>
      <Box
        sx={{
          height: '100vh',
          maxHeight: '100vh',
          width: '100vw',
          maxWidth: '100vw',
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: 'background.default',
          m: 0,
          p: 0,
        }}
      >
        {/* Navigation Sidebar - Fixed in place, never shifts position between pages */}
        <Sidebar />

        {/* Content Area - Fills 100% of remaining width with zero jumping */}
        <Box
          sx={{
            flex: 1,
            height: '100vh',
            maxHeight: '100vh',
            display: 'flex',
            minWidth: 0,
            overflow: 'hidden',
            p: 0,
            m: 0,
          }}
        >
          {/* Middle Main Section - Independently scrolling on feed, full size on chat */}
          <Box
            component="main"
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: isMessages ? '100%' : { xs: '100%', sm: 640, md: 680, lg: 720 },
              height: '100vh',
              maxHeight: '100vh',
              overflowY: isMessages ? 'hidden' : 'auto',
              overflowX: 'hidden',
              borderInlineEnd: isMessages ? 'none' : { xs: 'none', sm: '1px solid' },
              borderColor: 'divider',
              position: 'relative',
              display: isMessages ? 'flex' : 'block',
              flexDirection: isMessages ? 'column' : 'unset',
              p: 0,
              m: 0,
              pb: isMessages ? 0 : { xs: 'calc(60px + env(safe-area-inset-bottom, 0px))', sm: 0 },
              scrollbarWidth: 'thin',
            }}
          >
            {/* Mobile Top Header - hidden on messages page */}
            {!isMessages && <MobileHeader />}

            {/* Page Content */}
            {children}

            {/* Mobile Floating Action Button - hidden on messages page */}
            {!isMessages && <MobilePostFab onClick={onFabClick} />}
          </Box>

          {/* Right/Left Sidebar Widgets - hidden on messages page */}
          {!isMessages && <RightWidgets />}
        </Box>

        {/* Mobile Fixed Bottom Navigation - hidden on messages page */}
        {!isMessages && <MobileBottomNav />}
      </Box>
    </AuthGuard>
  );
}
