'use client';

import * as React from 'react';
import {
  Box,
  Avatar,
  InputBase,
  Button,
  IconButton,
  Stack,
  CircularProgress,
  Typography,
} from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useAuth } from '@/hooks/useAuth';

interface TweetComposerProps {
  onPost?: (content: string) => Promise<void> | void;
}

const MAX_CHARS = 280;

export default function TweetComposer({ onPost }: TweetComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const charCount = content.length;
  const progress = Math.min((charCount / MAX_CHARS) * 100, 100);
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  const handlePost = async () => {
    if (!canPost) return;
    const draftText = content;
    setIsSubmitting(true);

    try {
      if (onPost) {
        await onPost(draftText);
      }
      setContent('');
      setIsFocused(false);
    } catch {
      // On failure, draft content is preserved so the user can re-try
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 1.5,
      }}
    >
      <Avatar
        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
        alt={user?.name || 'تصویر کاربر'}
        sx={{ width: 40, height: 40 }}
      />

      <Box sx={{ flex: 1 }}>
        {/* Text Input Area */}
        <InputBase
          placeholder="چه اتفاقی در حال رخ دادن است؟!"
          multiline
          minRows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          disabled={isSubmitting}
          sx={{
            width: '100%',
            color: 'text.primary',
            fontSize: '1.15rem',
            lineHeight: 1.5,
            pt: 0.5,
            pb: 1,
            '& input::placeholder': {
              color: 'text.secondary',
              opacity: 1,
            },
          }}
        />

        {/* Audience Pill */}
        {(isFocused || content.length > 0) && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'primary.main',
              borderRadius: 9999,
              px: 1.5,
              py: 0.3,
              cursor: 'pointer',
              mb: 1.5,
              fontSize: '0.875rem',
              fontWeight: 700,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <PublicIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              همه می‌توانند پاسخ دهند
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            pt: 1,
            borderTop: isFocused || content.length > 0 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {/* Action Icons */}
          <Stack direction="row" spacing={0.25} sx={{ color: 'primary.main' }}>
            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="افزودن تصویر" disabled={isSubmitting}>
              <ImageOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="افزودن گیف" disabled={isSubmitting}>
              <GifBoxOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="ایجاد نظرسنجی" disabled={isSubmitting}>
              <BallotOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="افزودن ایموجی" disabled={isSubmitting}>
              <SentimentSatisfiedAltOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="زمان‌بندی ارسال" disabled={isSubmitting}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="افزودن موقعیت مکانی" disabled={isSubmitting}>
              <FmdGoodOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>

          {/* Right Action: Character Count & Post Button */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {charCount > 0 && (
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={24}
                  thickness={5}
                  sx={{
                    color: isOverLimit
                      ? 'error.main'
                      : progress > 80
                      ? 'warning.main'
                      : 'primary.main',
                  }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              disabled={!canPost}
              onClick={handlePost}
              sx={{
                px: 2.5,
                py: 0.8,
                fontWeight: 700,
                fontSize: '0.9375rem',
                opacity: canPost ? 1 : 0.5,
                minWidth: 90,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'ارسال پست'
              )}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
