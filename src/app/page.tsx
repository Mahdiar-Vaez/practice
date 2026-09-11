'use client';

import * as React from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AppLayout from '@/components/layout/AppLayout';
import TweetComposer from '@/components/tweet/TweetComposer';
import TweetCard from '@/components/tweet/TweetCard';
import { TweetData } from '@/types/api';
import { tweetService } from '@/services/tweet.service';
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
    likesCount: 5890,
    commentsCount: 342,
    repostsCount: 1204,
    views: '۱۴۲K',
    isLiked: false,
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
    likesCount: 1430,
    commentsCount: 89,
    repostsCount: 215,
    views: '۴۵.۸K',
    isLiked: false,
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
    likesCount: 890,
    commentsCount: 56,
    repostsCount: 132,
    views: '۲۸.۱K',
    isLiked: false,
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
  const [loading, setLoading] = React.useState(true);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);

  // Fetch feed on initial load with fallback
  React.useEffect(() => {
    let isMounted = true;
    tweetService
      .getFeed()
      .then((feed) => {
        if (isMounted && feed.length > 0) {
          setTweets(feed);
        }
      })
      .catch(() => {
        // Fallback silently to initial mock tweets if backend is not reachable
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNewTweet = async (content: string) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticTweet: TweetData = {
      id: tempId,
      author: {
        name: user?.name || 'کاربر دمو',
        handle: user ? `@${user.username}` : '@demo',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        verified: true,
      },
      time: 'همین الان',
      content,
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      views: '۱',
      isLiked: false,
      stats: {
        replies: 0,
        reposts: 0,
        likes: 0,
        views: '۱',
      },
    };

    // Optimistically prepend to feed
    setTweets((prev) => [optimisticTweet, ...prev]);

    try {
      const createdTweet = await tweetService.createTweet(content);
      // Replace optimistic placeholder with real tweet
      setTweets((prev) =>
        prev.map((t) => (t.id === tempId ? createdTweet : t))
      );
    } catch (err: any) {
      // Rollback on failure
      setTweets((prev) => prev.filter((t) => t.id !== tempId));
      const message = err?.message || 'خطا در ثبت پست؛ ارتباط با سرور برقرار نشد. متن شما بازیابی شد.';
      setSnackbarMessage(message);
      // Re-throw so TweetComposer retains the draft text
      throw err;
    }
  };

  const handleCommentCountChange = (tweetId: string, newCount: number) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === tweetId
          ? {
              ...t,
              commentsCount: newCount,
              stats: t.stats ? { ...t.stats, replies: newCount } : undefined,
            }
          : t
      )
    );
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          tweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onError={(msg) => setSnackbarMessage(msg)}
              onCommentCountChange={handleCommentCountChange}
            />
          ))
        )}
      </Box>

      {/* Persian Snackbar Notification for Offline / Errors */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          onClose={() => setSnackbarMessage(null)}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
