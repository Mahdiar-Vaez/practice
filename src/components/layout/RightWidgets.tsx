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
  { category: 'فناوری · ترند روز', topic: '#نکست_جی_اس_۱۶', posts: '۴۸.۲ هزار پست' },
  { category: 'طراحی · داغ‌ترین‌ها', topic: 'رابط کاربری و تجربه کاربری', posts: '۲۴.۹ هزار پست' },
  { category: 'هوش مصنوعی · فناوری', topic: 'مدل‌های زبانی بزرگ (LLM)', posts: '۱۱۲.۵ هزار پست' },
  { category: 'توسعه وب · برنامه‌نویسی', topic: 'متریال یو‌آی نسخه ۶', posts: '۱۸.۷ هزار پست' },
  { category: 'ورزش · پرطرفدار', topic: 'لیگ قهرمانان اروپا', posts: '۸۹.۴ هزار پست' },
];

const FOLLOW_SUGGESTIONS = [
  {
    name: 'متریال یو‌آی',
    handle: '@MUI_core',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'تیم نکست‌جی‌اس',
    handle: '@nextjs',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'ورسل',
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
      {/* Sticky Search Header */}
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
              ml: 1.5,
            }}
          />
          <InputBase
            placeholder="جستجو در توییتر..."
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
            borderRadius: '16px',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            خرید اشتراک ویژه (Premium)
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', mb: 1.5, lineHeight: 1.45 }}
          >
            با خرید اشتراک، به قابلیت‌های انحصاری، تیک آبی و سهم از درآمد تبلیغات دسترسی پیدا کنید.
          </Typography>
          <Button variant="contained" color="primary" sx={{ px: 2.5, py: 0.8, borderRadius: 9999, fontWeight: 700 }}>
            خرید اشتراک
          </Button>
        </Box>

        {/* What's Happening (Trending Widget) */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            backgroundColor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, px: 2, pt: 1.5, pb: 1 }}>
            ترندها و رویدادهای روز
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              نمایش بیشتر
            </Typography>
          </Box>
        </Box>

        {/* Who to Follow Card */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            backgroundColor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, px: 2, pt: 1.5, pb: 1 }}>
            پیشنهاد برای دنبال کردن
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
                    borderRadius: 9999,
                  }}
                >
                  دنبال کردن
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              نمایش بیشتر
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
              gap: '6px 12px',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>شرایط خدمات</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>حریم خصوصی</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>خط‌مشی کوکی‌ها</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>دسترسی‌پذیری</Box>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>اطلاعات تبلیغات</Box>
            <Box component="span">© ۲۰۲۶ شرکت ایکس</Box>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
