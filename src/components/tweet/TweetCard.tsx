'use client';

import * as React from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export interface TweetData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  time: string;
  content: string;
  mediaUrl?: string;
  stats: {
    replies: number;
    reposts: number;
    likes: number;
    views: string;
  };
}

interface TweetCardProps {
  tweet: TweetData;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(tweet.stats.likes);
  const [reposted, setReposted] = React.useState(false);
  const [repostCount, setRepostCount] = React.useState(tweet.stats.reposts);
  const [bookmarked, setBookmarked] = React.useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLikeCount((prev) => prev - 1);
      setLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setLiked(true);
    }
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reposted) {
      setRepostCount((prev) => prev - 1);
      setReposted(false);
    } else {
      setRepostCount((prev) => prev + 1);
      setReposted(true);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => !prev);
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 1.5,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {/* Author Avatar */}
      <Avatar
        src={tweet.author.avatar}
        alt={tweet.author.name}
        sx={{ width: 40, height: 40 }}
      />

      {/* Tweet Body & Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header: Name, Handle, Timestamp, Menu */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexWrap: 'wrap', minWidth: 0 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {tweet.author.name}
            </Typography>
            {tweet.author.verified && (
              <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            )}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {tweet.author.handle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ·
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {tweet.time}
            </Typography>
          </Stack>

          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
              p: 0.5,
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(29, 155, 240, 0.1)',
              },
            }}
            aria-label="گزینه‌های بیشتر"
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Text Content */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            mt: 0.5,
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            fontSize: '0.9375rem',
            lineHeight: 1.45,
          }}
        >
          {tweet.content}
        </Typography>

        {/* Optional Media Image */}
        {tweet.mediaUrl && (
          <Box
            sx={{
              mt: 1.5,
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 380,
            }}
          >
            <Box
              component="img"
              src={tweet.mediaUrl}
              alt="Tweet Media"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        {/* Interaction Buttons Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1.5,
            maxWidth: 450,
            color: 'text.secondary',
          }}
        >
          {/* Reply */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              cursor: 'pointer',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.main',
                '& .MuiIconButton-root': {
                  backgroundColor: 'rgba(29, 155, 240, 0.1)',
                  color: 'primary.main',
                },
              },
            }}
          >
            <IconButton size="small" sx={{ color: 'inherit', p: 0.8 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.8125rem' }}>
              {tweet.stats.replies}
            </Typography>
          </Stack>

          {/* Repost */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            onClick={handleRepost}
            sx={{
              cursor: 'pointer',
              color: reposted ? 'success.main' : 'inherit',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'success.main',
                '& .MuiIconButton-root': {
                  backgroundColor: 'rgba(0, 186, 124, 0.1)',
                  color: 'success.main',
                },
              },
            }}
          >
            <IconButton size="small" sx={{ color: 'inherit', p: 0.8 }}>
              <RepeatIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.8125rem' }}>
              {repostCount}
            </Typography>
          </Stack>

          {/* Like */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            onClick={handleLike}
            sx={{
              cursor: 'pointer',
              color: liked ? '#f91880' : 'inherit',
              transition: 'color 0.2s',
              '&:hover': {
                color: '#f91880',
                '& .MuiIconButton-root': {
                  backgroundColor: 'rgba(249, 24, 128, 0.1)',
                  color: '#f91880',
                },
              },
            }}
          >
            <IconButton size="small" sx={{ color: 'inherit', p: 0.8 }}>
              {liked ? (
                <FavoriteIcon sx={{ fontSize: 18, color: '#f91880' }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.8125rem' }}>
              {likeCount}
            </Typography>
          </Stack>

          {/* Views */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              cursor: 'pointer',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.main',
                '& .MuiIconButton-root': {
                  backgroundColor: 'rgba(29, 155, 240, 0.1)',
                  color: 'primary.main',
                },
              },
            }}
          >
            <IconButton size="small" sx={{ color: 'inherit', p: 0.8 }}>
              <BarChartIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.8125rem' }}>
              {tweet.stats.views}
            </Typography>
          </Stack>

          {/* Bookmark & Share Icons */}
          <Stack direction="row" spacing={0.25}>
            <IconButton
              size="small"
              onClick={handleBookmark}
              sx={{
                color: bookmarked ? 'primary.main' : 'inherit',
                p: 0.8,
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(29, 155, 240, 0.1)',
                },
              }}
              aria-label="نشانک‌گذاری"
            >
              {bookmarked ? (
                <BookmarkIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              ) : (
                <BookmarkBorderIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>

            <IconButton
              size="small"
              sx={{
                color: 'inherit',
                p: 0.8,
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(29, 155, 240, 0.1)',
                },
              }}
              aria-label="اشتراک‌گذاری"
            >
              <IosShareIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
