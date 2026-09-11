'use client';

import * as React from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AppLayout from '@/components/layout/AppLayout';
import TweetComposer from '@/components/tweet/TweetComposer';
import TweetCard, { TweetData } from '@/components/tweet/TweetCard';
import { useColorMode } from '@/theme/ThemeRegistry';
import { useAuth } from '@/hooks/useAuth';

const INITIAL_TWEETS: TweetData[] = [
  {
    id: '1',
    author: {
      name: 'نکست جی‌اس',
      handle: '@nextjs',
      avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80',
      verified: true,
    },
    time: '۲ ساعت پیش',
    content: 'نسخه ۱۶ نکست‌جی‌اس با کامپایل توربوپک فوق‌سریع، پشتیبانی رسمی از ری‌اکت ۱۹ و ارتقای چشمگیر سرور اکشن‌ها منتشر شد! 🚀\n\nبرای شروع دستور npx create-next-app@latest را اجرا کنید.',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    stats: {
      replies: 342,
      reposts: 1204,
      likes: 5890,
      views: '۱۴۲K',
    },
  },
  {
    id: '2',
    author: {
      name: 'متریال یو‌آی',
      handle: '@MUI_core',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      verified: true,
    },
    time: '۴ ساعت پیش',
    content: 'ترکیب متریال یو‌آی نسخه ۶ با اپ‌روتر نکست‌جی‌اس و پشتیبانی کامل از حالت تاریک OLED و چیدمان راست‌چین (RTL)، تجربه‌ای کاملاً بومی و روان را برای کاربران فارسی‌زبان فراهم می‌کند.\n\n#ری‌اکت #توسعه_وب #طراحی_رابط_کاربری',
    stats: {
      replies: 89,
      reposts: 215,
      likes: 1430,
      views: '۴۵.۸K',
    },
  },
  {
    id: '3',
    author: {
      name: 'دیزاین دایجست',
      handle: '@designdigest',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      verified: false,
    },
    time: '۶ ساعت پیش',
    content: 'طراحی ۳ ستونه مدرن با تراکم مناسب اطلاعات، مرزبندی‌های ظریف و انیمیشن‌های روان فیزیکی، همواره استاندارد طلایی داشبوردهای تعاملی و شبکه‌های اجتماعی است.',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    stats: {
      replies: 56,
      reposts: 132,
      likes: 890,
      views: '۲۸.۱K',
    },
  },
];

export default function HomePage() {
  const { mode } = useColorMode();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState(0);
  const [tweets, setTweets] = React.useState<TweetData[]>(INITIAL_TWEETS);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNewTweet = (content: string) => {
    const newTweet: TweetData = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'کاربر دمو',
        handle: user ? `@${user.username}` : '@demo',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        verified: true,
      },
      time: 'همین الان',
      content,
      stats: {
        replies: 0,
        reposts: 0,
        likes: 0,
        views: '۱',
      },
    };

    setTweets([newTweet, ...tweets]);
  };

  return (
    <AppLayout>
      {/* Sticky Header with "برای شما" / "دنبال‌شده‌ها" Tabs */}
      <Box
        sx={{
          position: 'sticky',
          top: { xs: 53, sm: 0 },
          backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ flex: 1 }}
          >
            <Tab label="برای شما" />
            <Tab label="دنبال‌شده‌ها" />
          </Tabs>

          <IconButton
            sx={{
              mx: 1,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label="تنظیمات تایم‌لاین"
          >
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Tweet Composer */}
      <TweetComposer onPost={handleNewTweet} />

      {/* Feed List */}
      <Box component="section" aria-label="تایم‌لاین پست‌ها">
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </Box>
    </AppLayout>
  );
}
