'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: 2,
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              color: 'text.primary',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
          Sign in to X
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
              py: 1.2,
              borderRadius: 8,
              color: 'text.primary',
              borderColor: 'divider',
              fontWeight: 700,
            }}
          >
            Sign in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mb: 3,
              py: 1.2,
              borderRadius: 8,
              color: 'text.primary',
              borderColor: 'divider',
              fontWeight: 700,
            }}
          >
            Sign in with Apple
          </Button>

          <Divider sx={{ mb: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
            or
          </Divider>

          <TextField
            fullWidth
            label="Phone, email, or username"
            variant="outlined"
            margin="normal"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{
              py: 1.2,
              borderRadius: 8,
              fontWeight: 700,
              mb: 2,
            }}
          >
            Next
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              py: 1.2,
              borderRadius: 8,
              fontWeight: 700,
              mb: 4,
            }}
          >
            Forgot password?
          </Button>

          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#1d9bf0', textDecoration: 'none' }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

