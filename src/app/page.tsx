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

const INITIAL_TWEETS: TweetData[] = [
  {
    id: '1',
    author: {
      name: 'Next.js',
      handle: '@nextjs',
      avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80',
      verified: true,
    },
    time: '2h',
    content: 'Next.js 16 is now live with lightning-fast Turbopack compilation, React 19 support, and enhanced server actions! 🚀\n\nTry it now: npx create-next-app@latest',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    stats: {
      replies: 342,
      reposts: 1204,
      likes: 5890,
      views: '142K',
    },
  },
  {
    id: '2',
    author: {
      name: 'Material UI',
      handle: '@MUI_core',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      verified: true,
    },
    time: '4h',
    content: 'Material UI v6 paired with Next.js App Router and Dark Mode OLED palette gives your app incredible performance and native feel.\n\n#React #MUI #WebDev',
    stats: {
      replies: 89,
      reposts: 215,
      likes: 1430,
      views: '45.8K',
    },
  },
  {
    id: '3',
    author: {
      name: 'Design Digest',
      handle: '@designdigest',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      verified: false,
    },
    time: '6h',
    content: 'The 3-column desktop layout with high information density, subtle borders, and spring physics micro-interactions remains the gold standard for social media dashboards.',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    stats: {
      replies: 56,
      reposts: 132,
      likes: 890,
      views: '28.1K',
    },
  },
];

export default function HomePage() {
  const { mode } = useColorMode();
  const [activeTab, setActiveTab] = React.useState(0);
  const [tweets, setTweets] = React.useState<TweetData[]>(INITIAL_TWEETS);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNewTweet = (content: string) => {
    const newTweet: TweetData = {
      id: Date.now().toString(),
      author: {
        name: 'Alex Dev',
        handle: '@alex_builder',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        verified: true,
      },
      time: 'Just now',
      content,
      stats: {
        replies: 0,
        reposts: 0,
        likes: 0,
        views: '1',
      },
    };

    setTweets([newTweet, ...tweets]);
  };

  return (
    <AppLayout>
      {/* Sticky Header with "For you" / "Following" Tabs */}
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
            <Tab label="For you" />
            <Tab label="Following" />
          </Tabs>

          <IconButton
            sx={{
              mx: 1,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label="Timeline Settings"
          >
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Tweet Composer */}
      <TweetComposer onPost={handleNewTweet} />

      {/* Feed List */}
      <Box component="section" aria-label="Timeline Feed">
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </Box>
    </AppLayout>
  );
}
