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
  Chip,
  Alert,
} from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useAuth } from '@/hooks/useAuth';
import { uploadService } from '@/services/upload.service';

interface TweetComposerProps {
  onPost?: (content: string, mediaUrl?: string) => Promise<void> | void;
}

const MAX_CHARS = 280;

export default function TweetComposer({ onPost }: TweetComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Attachments
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);
  const [documentAttachment, setDocumentAttachment] = React.useState<{
    name: string;
    url: string;
  } | null>(null);

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const docInputRef = React.useRef<HTMLInputElement | null>(null);

  const charCount = content.length;
  const progress = Math.min((charCount / MAX_CHARS) * 100, 100);
  const isOverLimit = charCount > MAX_CHARS;
  const hasAttachment = Boolean(mediaUrl || documentAttachment);
  const canPost =
    (content.trim().length > 0 || hasAttachment) && !isOverLimit && !isSubmitting && !isUploading;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadFile(file);
      const fullUrl = `http://localhost:5000${res.url}`;
      setMediaUrl(fullUrl);
      setDocumentAttachment(null);
    } catch (err: any) {
      setUploadError(err?.message || 'خطا در بارگذاری تصویر');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadFile(file);
      const fullUrl = `http://localhost:5000${res.url || res.data?.url || ''}`;
      setDocumentAttachment({ name: res.originalName || file.name, url: fullUrl });
      setMediaUrl(null);
    } catch (err: any) {

      setUploadError(err?.message || 'خطا در بارگذاری سند');
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!canPost) return;
    const draftText = content;
    const attached = mediaUrl || documentAttachment?.url;
    setIsSubmitting(true);

    try {
      if (onPost) {
        await onPost(draftText, attached || undefined);
      }
      setContent('');
      setMediaUrl(null);
      setDocumentAttachment(null);
      setIsFocused(false);
    } catch {
      // Retain draft on failure
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
        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
        alt={user?.name || 'تصویر کاربر'}
        sx={{ width: 40, height: 40 }}
      />

      <Box sx={{ flex: 1 }}>
        {uploadError && (
          <Alert severity="warning" onClose={() => setUploadError(null)} sx={{ mb: 1.5, borderRadius: 2 }}>
            {uploadError}
          </Alert>
        )}

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

        {/* Image Preview */}
        {mediaUrl && (
          <Box sx={{ position: 'relative', my: 1.5, maxWidth: 360, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              component="img"
              src={mediaUrl}
              alt="پیش‌نمایش تصویر"
              sx={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }}
            />
            <IconButton
              size="small"
              onClick={() => setMediaUrl(null)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
              }}
              aria-label="حذف تصویر"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Document Preview */}
        {documentAttachment && (
          <Box sx={{ my: 1.5 }}>
            <Chip
              icon={<PictureAsPdfOutlinedIcon />}
              label={`سند پیوست شده: ${documentAttachment.name}`}
              onDelete={() => setDocumentAttachment(null)}
              color="primary"
              variant="outlined"
              sx={{ py: 2, px: 1, borderRadius: 2, fontWeight: 700 }}
            />
          </Box>
        )}

        {/* Audience Pill */}
        {(isFocused || content.length > 0 || hasAttachment) && (
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
            borderTop: isFocused || content.length > 0 || hasAttachment ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {/* Action Icons */}
          <Stack direction="row" spacing={0.25} sx={{ color: 'primary.main' }}>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={handleImageSelect}
            />
            <IconButton
              size="small"
              sx={{ color: 'primary.main' }}
              aria-label="افزودن تصویر"
              disabled={isSubmitting || isUploading}
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword"
              hidden
              onChange={handleDocumentSelect}
            />
            <IconButton
              size="small"
              sx={{ color: 'primary.main' }}
              aria-label="افزودن سند یا فایل"
              disabled={isSubmitting || isUploading}
              onClick={() => docInputRef.current?.click()}
            >
              <AttachFileOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="افزودن ایموجی" disabled={isSubmitting}>
              <SentimentSatisfiedAltOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>

          {/* Right Action: Character Count & Post Button */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {isUploading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  در حال آپلود...
                </Typography>
              </Stack>
            )}

            {charCount > 0 && !isUploading && (
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
