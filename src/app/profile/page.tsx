'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Stack,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import TweetCard from '@/components/tweet/TweetCard';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import { TweetData, CommentData, User } from '@/types/api';
import EditProfileDialog from '@/components/profile/EditProfileDialog';
import DeleteAccountDialog from '@/components/profile/DeleteAccountDialog';

export default function ProfilePage() {
  const { user: authUser, login, token } = useAuth();
  const [profileUser, setProfileUser] = React.useState<User | null>(authUser);
  const [tab, setTab] = React.useState<0 | 1 | 2>(0);

  const [tweets, setTweets] = React.useState<TweetData[]>([]);
  const [comments, setComments] = React.useState<CommentData[]>([]);
  const [likes, setLikes] = React.useState<TweetData[]>([]);
  const [loadingContent, setLoadingContent] = React.useState(false);

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (authUser) {
      setProfileUser(authUser);
    }
  }, [authUser]);

  // Fetch tab content when tab or user changes
  React.useEffect(() => {
    if (!profileUser?.id) return;

    let isMounted = true;
    setLoadingContent(true);

    if (tab === 0) {
      userService
        .getUserTweets(profileUser.id)
        .then((data) => isMounted && setTweets(data))
        .catch(() => isMounted && setTweets([]))
        .finally(() => isMounted && setLoadingContent(false));
    } else if (tab === 1) {
      userService
        .getUserComments(profileUser.id)
        .then((data) => isMounted && setComments(data))
        .catch(() => isMounted && setComments([]))
        .finally(() => isMounted && setLoadingContent(false));
    } else if (tab === 2) {
      userService
        .getUserLikes(profileUser.id)
        .then((data) => isMounted && setLikes(data))
        .catch(() => isMounted && setLikes([]))
        .finally(() => isMounted && setLoadingContent(false));
    }

    return () => {
      isMounted = false;
    };
  }, [profileUser?.id, tab]);

  const handleProfileUpdated = (updated: User) => {
    setProfileUser(updated);
    if (token) {
      login({ token, user: updated });
    }
  };

  const displayName = profileUser?.name || 'کاربر';
  const displayHandle = profileUser ? `@${profileUser.username}` : '@user';
  const displayAvatar =
    profileUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
  const displayBio = profileUser?.bio || 'هنوز بیوگرافی اضافه نشده است.';

  return (
    <AppLayout>
      {/* Sticky Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <IconButton sx={{ color: 'text.primary' }}>
            <ArrowForwardIcon />
          </IconButton>
        </Link>
        <Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {displayName}
            </Typography>
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {tweets.length} پست
          </Typography>
        </Box>
      </Box>

      {/* Profile Header Banner & Details */}
      <Box sx={{ position: 'relative' }}>
        {/* Cover image banner */}
        <Box
          sx={{
            height: 180,
            background: 'linear-gradient(135deg, #1d9bf0 0%, #0c4a6e 100%)',
          }}
        />

        {/* Avatar & Action Buttons Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            px: 2,
            mb: 1.5,
            mt: -6,
          }}
        >
          <Avatar
            src={displayAvatar}
            alt={displayName}
            sx={{
              width: 110,
              height: 110,
              border: '4px solid',
              borderColor: 'background.default',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditOpen(true)}
              sx={{
                borderRadius: 9999,
                fontWeight: 700,
                px: 2,
                py: 0.7,
                fontSize: '0.875rem',
              }}
            >
              ویرایش پروفایل
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteOpen(true)}
              sx={{
                borderRadius: 9999,
                fontWeight: 700,
                px: 2,
                py: 0.7,
                fontSize: '0.875rem',
              }}
            >
              حذف حساب
            </Button>
          </Stack>
        </Box>

        {/* User Info Details */}
        <Box sx={{ px: 2, mt: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {displayName}
            </Typography>
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', direction: 'ltr', textAlign: 'right' }}>
            {displayHandle}
          </Typography>

          <Typography variant="body1" sx={{ mt: 1.5, color: 'text.primary', lineHeight: 1.6 }}>
            {displayBio}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, color: 'text.secondary' }}>
            <CalendarMonthOutlinedIcon fontSize="small" />
            <Typography variant="caption">عضو شده در توییتر / X</Typography>
          </Stack>
        </Box>
      </Box>

      {/* Activity Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mt: 2 }}>
        <Tabs
          value={tab}
          onChange={(_e, val) => setTab(val)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.95rem',
              py: 1.5,
            },
          }}
        >
          <Tab label={`پست‌ها (${tweets.length})`} />
          <Tab label={`پاسخ‌ها (${comments.length})`} />
          <Tab label={`پسندیده‌ها (${likes.length})`} />
        </Tabs>
      </Box>

      {/* Tab Content Display */}
      <Box sx={{ minHeight: 250 }}>
        {loadingContent ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : tab === 0 ? (
          tweets.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
              هنوز پستی ارسال نشده است.
            </Typography>
          ) : (
            tweets.map((t) => <TweetCard key={t.id} tweet={t} />)
          )
        ) : tab === 1 ? (
          comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
              هنوز پاسخی ارسال نشده است.
            </Typography>
          ) : (
            comments.map((c) => (
              <Box
                key={c.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1.5,
                }}
              >
                <Avatar src={c.author.avatar} alt={c.author.name} sx={{ width: 40, height: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {c.author.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {c.author.handle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      · {c.time}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.primary' }}>
                    {c.content}
                  </Typography>
                </Box>
              </Box>
            ))
          )
        ) : likes.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
            هنوز پستی پسندیده نشده است.
          </Typography>
        ) : (
          likes.map((t) => <TweetCard key={t.id} tweet={t} />)
        )}
      </Box>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentUser={profileUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </AppLayout>
  );
}
