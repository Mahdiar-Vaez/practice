'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Avatar,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AppLayout from '@/components/layout/AppLayout';
import TweetCard from '@/components/tweet/TweetCard';
import { searchService, TrendingHashtag } from '@/services/search.service';
import { TweetData, User } from '@/types/api';
import { useSearchParams } from 'next/navigation';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [tab, setTab] = React.useState<0 | 1 | 2>(0);
  const [onlyMedia, setOnlyMedia] = React.useState(false);

  const [trending, setTrending] = React.useState<TrendingHashtag[]>([]);
  const [tweets, setTweets] = React.useState<TweetData[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch trending hashtags on mount
  React.useEffect(() => {
    searchService
      .getTrending()
      .then((data) => setTrending(data))
      .catch(() => setTrending([]));
  }, []);

  // Perform search when query changes
  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setTweets([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      searchService
        .search(trimmed)
        .then((res) => {
          setTweets(res.tweets);
          setUsers(res.users);
        })
        .catch(() => {
          setTweets([]);
          setUsers([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const displayedTweets = onlyMedia
    ? tweets.filter((t) => Boolean(t.mediaUrl))
    : tweets;

  return (
    <AppLayout>
      {/* Sticky Header with Search Input */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 1.5,
        }}
      >
        <TextField
          fullWidth
          placeholder="جستجو در توییت‌ها، هشتگ‌ها و کاربران..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 9999,
              backgroundColor: 'action.hover',
            },
          }}
        />

        {/* Tabs */}
        {query.trim() && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              sx={{ '& .MuiTab-root': { fontWeight: 700, minWidth: 80 } }}
            >
              <Tab label="همه" />
              <Tab label={`پست‌ها (${displayedTweets.length})`} />
              <Tab label={`کاربران (${users.length})`} />
            </Tabs>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={onlyMedia}
                  onChange={(e) => setOnlyMedia(e.target.checked)}
                />
              }
              label={<Typography variant="caption">فقط رسانه‌دار</Typography>}
              sx={{ mr: 1 }}
            />
          </Box>
        )}
      </Box>

      {/* Main Body */}
      <Box sx={{ p: 2 }}>
        {/* Trending Section when not searching */}
        {!query.trim() && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <LocalFireDepartmentIcon sx={{ color: '#f91880' }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                موضوعات و هشتگ‌های داغ
              </Typography>
            </Stack>

            {trending.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                هشتگ‌های پرطرفدار به زودی نمایش داده می‌شوند...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {trending.map((item) => (
                  <Chip
                    key={item.tag}
                    label={`#${item.tag} (${item.count} پست)`}
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => setQuery(`#${item.tag}`)}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 3,
                      py: 2,
                      px: 1,
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Search Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : query.trim() ? (
          tab === 0 ? (
            <Stack spacing={2}>
              {/* Users snippet */}
              {users.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                    کاربران یافته شده ({users.length})
                  </Typography>
                  <Stack spacing={1}>
                    {users.slice(0, 3).map((u) => (
                      <Box
                        key={u.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Avatar src={u.avatar} sx={{ width: 42, height: 42 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {u.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            @{u.username}
                          </Typography>
                          {u.bio && (
                            <Typography variant="body2" noWrap sx={{ mt: 0.5, color: 'text.primary' }}>
                              {u.bio}
                            </Typography>
                          )}

                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Tweets snippet */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                پست‌های مرتبط ({displayedTweets.length})
              </Typography>
              {displayedTweets.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                  هیچ پستی منطبق با «{query}» یافت نشد.
                </Typography>
              ) : (
                displayedTweets.map((t) => <TweetCard key={t.id} tweet={t} />)
              )}
            </Stack>
          ) : tab === 1 ? (
            displayedTweets.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                هیچ پستی یافت نشد.
              </Typography>
            ) : (
              displayedTweets.map((t) => <TweetCard key={t.id} tweet={t} />)
            )
          ) : users.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              هیچ کاربری با این مشخصات یافت نشد.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {users.map((u) => (
                <Box
                  key={u.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar src={u.avatar} sx={{ width: 44, height: 44 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      @{u.username}
                    </Typography>
                    {u.bio && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'text.primary' }}>
                        {u.bio}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )
        ) : null}
      </Box>
    </AppLayout>
  );
}

export default function ExplorePage() {
  return (
    <React.Suspense fallback={<CircularProgress />}>
      <ExploreContent />
    </React.Suspense>
  );
}
