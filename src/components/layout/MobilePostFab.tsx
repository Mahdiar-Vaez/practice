'use client';

import * as React from 'react';
import { Fab, Box } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';

interface MobilePostFabProps {
  onClick?: () => void;
}

export default function MobilePostFab({ onClick }: MobilePostFabProps) {
  return (
    <Box
      sx={{
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        bottom: 'calc(68px + env(safe-area-inset-bottom, 0px))',
        right: 16,
        zIndex: 1099,
      }}
    >
      <Fab
        color="primary"
        aria-label="Create Post"
        onClick={onClick}
        sx={{
          width: 56,
          height: 56,
          boxShadow: '0 8px 16px rgba(29, 155, 240, 0.4)',
          transition: 'transform 0.15s ease',
          '&:active': {
            transform: 'scale(0.92)',
          },
        }}
      >
        <CreateIcon sx={{ fontSize: 26, color: '#ffffff' }} />
      </Fab>
    </Box>
  );
}
