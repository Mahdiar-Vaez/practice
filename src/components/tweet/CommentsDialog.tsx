'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  InputBase,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import { TweetData, CommentData } from '@/types/api';
import { tweetService } from '@/services/tweet.service';
import { useAuth } from '@/hooks/useAuth';

interface CommentsDialogProps {
  open: boolean;
  onClose: () => void;
  tweet: TweetData | null;
  onCommentAdded?: (comment: CommentData) => void;
}

export default function CommentsDialog({
  open,
  onClose,
  tweet,
  onCommentAdded,
}: CommentsDialogProps) {
  const { user } = useAuth();
  const [comments, setComments] = React.useState<CommentData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch comments when dialog opens for a tweet
  React.useEffect(() => {
    if (!open || !tweet) {
      setComments([]);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    tweetService
      .getComments(tweet.id)
      .then((data) => {
        if (isMounted) {
          setComments(data);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          // If server is offline, display fallback Persian notice without breaking
          setErrorMessage(err?.message || 'ارتباط با سرور برقرار نشد؛ نمایش نظرات در حالت آفلاین.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, tweet]);

  if (!tweet) return null;

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;

    const draftText = trimmed;
    setSubmitting(true);
    setErrorMessage(null);

    // Optimistic comment creation
    const tempId = `temp_${Date.now()}`;
    const optimisticComment: CommentData = {
      id: tempId,
      tweetId: tweet.id,
      author: {
        name: user?.name || 'کاربر مهمان',
        handle: user ? `@${user.username}` : '@user',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        verified: true,
      },
      content: draftText,
      time: 'همین الان',
      createdAt: new Date().toISOString(),
    };

    // Update UI immediately (optimistic)
    setComments((prev) => [optimisticComment, ...prev]);
    setCommentText('');

    try {
      const savedComment = await tweetService.addComment(tweet.id, draftText);
      // Replace optimistic item with persisted comment
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? savedComment : c))
      );
      if (onCommentAdded) {
        onCommentAdded(savedComment);
      }
    } catch (err: any) {
      // Rollback optimistic state on error
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setCommentText(draftText); // Restore input text so user does not lose input
      setErrorMessage(
        err?.message || 'خطا در ثبت نظر؛ ارتباط با سرور برقرار نشد. متن شما بازیابی شد.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          px: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          پاسخ‌ها و نظرات
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="بستن">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Error notification banner */}
        {errorMessage && (
          <Alert
            severity="warning"
            onClose={() => setErrorMessage(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Parent Tweet Preview */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            p: 1.5,
            mb: 2,
            backgroundColor: 'action.hover',
            borderRadius: 3,
          }}
        >
          <Avatar
            src={tweet.author.avatar}
            alt={tweet.author.name}
            sx={{ width: 40, height: 40 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {tweet.author.name}
              </Typography>
              {tweet.author.verified && (
                <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {tweet.author.handle}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: 'text.primary',
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}
            >
              {tweet.content}
            </Typography>
          </Box>
        </Box>

        {/* Reply Composer Input */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            mb: 2,
          }}
        >
          <Avatar
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user?.name || 'تصویر کاربر'}
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ flex: 1 }}>
            <InputBase
              placeholder="پاسخ خود را بنویسید..."
              multiline
              minRows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              sx={{
                width: '100%',
                fontSize: '0.95rem',
                color: 'text.primary',
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 1,
              }}
            >
              <Button
                variant="contained"
                size="small"
                disabled={!commentText.trim() || submitting}
                onClick={handleAddComment}
                sx={{
                  borderRadius: 9999,
                  px: 2.5,
                  fontWeight: 700,
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'ارسال پاسخ'
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Comments List */}
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          نظرات ({comments.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : comments.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}
          >
            هنوز پاسخی ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Avatar
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  sx={{ width: 34, height: 34 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {comment.author.name}
                    </Typography>
                    {comment.author.verified && (
                      <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {comment.author.handle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ·
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {comment.time}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color: 'text.primary',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                    }}
                  >
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
