'use client';

import * as React from 'react';
import {
  Box,
  InputBase,
  Typography,
  Button,
  Avatar,
  Stack,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useColorMode } from '@/theme/ThemeRegistry';

const TRENDS = [
  { category: 'Technology · Trending', topic: '#Nextjs16', posts: '48.2K posts' },
  { category: 'Design · Trending', topic: 'UI/UX Pro Max', posts: '24.9K posts' },
  { category: 'Artificial Intelligence · Trending', topic: 'Gemini 2.0 Flash', posts: '112.5K posts' },
  { category: 'Web Development · Trending', topic: 'Material UI v6', posts: '18.7K posts' },
  { category: 'Sports · Trending', topic: 'Champions League', posts: '89.4K posts' },
];

const FOLLOW_SUGGESTIONS = [
  {
    name: 'Material UI',
    handle: '@MUI_core',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Next.js',
    handle: '@nextjs',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Vercel',
    handle: '@vercel',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&auto=format&fit=crop&q=80',
    verified: true,
  },
];

export default function RightWidgets() {
  const { mode } = useColorMode();
  const [isFocused, setIsFocused] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <Box
      component="aside"
      sx={{
        width: 350,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: { xs: 'none', lg: 'block' },
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* Sticky Search Header: Exactly 53px high in a row with center feed header, covering full width */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          height: 53,
          width: '100%',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: 42,
            backgroundColor: isFocused
              ? 'background.default'
              : mode === 'dark'
              ? '#202327'
              : '#eff3f4',
            border: '1px solid',
            borderColor: isFocused ? 'primary.main' : 'transparent',
            borderRadius: 9999,
            px: 2,
            transition: 'all 0.2s ease',
          }}
        >
          <SearchIcon
            sx={{
              color: isFocused ? 'primary.main' : 'text.secondary',
              fontSize: 20,
              mr: 1.5,
            }}
          />
          <InputBase
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            sx={{
              color: 'text.primary',
              fontSize: '0.9375rem',
              width: '100%',
              '& input::placeholder': {
                color: 'text.secondary',
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>

      {/* Widgets Content Area */}
      <Stack spacing={2} sx={{ px: 3, pt: 1.5, pb: 4 }}>
        {/* Subscribe to Premium Card */}
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px', // Clean Twitter 16px radius
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            Subscribe to Premium
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', mb: 1.5, lineHeight: 1.35 }}
          >
            Subscribe to unlock new features and if eligible, receive a share of ads revenue.
          </Typography>
          <Button variant="contained" color="primary" sx={{ px: 2.5, py: 0.8 }}>
            Subscribe
          </Button>
        </Box>

        {/* What's Happening (Trending Widget) */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px', // Clean Twitter 16px radius
            backgroundColor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, px: 2, pt: 1.5, pb: 1 }}>
            What&apos;s happening
          </Typography>

          <Stack>
            {TRENDS.map((trend) => (
              <Box
                key={trend.topic}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {trend.category}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, mt: 0.25, color: 'text.primary' }}
                  >
                    {trend.topic}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}
                  >
                    {trend.posts}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              p: 2,
              cursor: 'pointer',
              color: 'primary.main',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Show more
            </Typography>
          </Box>
        </Box>

        {/* Who to Follow Card */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px', // Clean Twitter 16px radius
            backgroundColor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, px: 2, pt: 1.5, pb: 1 }}>
            Who to follow
          </Typography>

          <Stack>
            {FOLLOW_SUGGESTIONS.map((user) => (
              <Box
                key={user.handle}
                sx={{
                  px: 2,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={user.avatar} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {user.name}
                      </Typography>
                      {user.verified && (
                        <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      )}
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', lineHeight: 1.2 }}
                    >
                      {user.handle}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{
                    px: 2,
                    py: 0.6,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Follow
                </Button>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              p: 2,
              cursor: 'pointer',
              color: 'primary.main',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Show more
            </Typography>
          </Box>
        </Box>

        {/* Legal & Footer Links */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 10px',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
            }}
          >
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Cookie Policy</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Accessibility</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Ads info</Box>
            <Box component="span">© 2026 X Corp.</Box>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
