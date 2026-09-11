'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { userService } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteAccount();
      logout();
      router.replace('/login');
    } catch (err: any) {
      setError(err?.message || 'خطا در حذف حساب کاربری. لطفاً دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: 'error.main', pb: 1 }}>
        حذف دائمی حساب کاربری
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 1.5, lineHeight: 1.6 }}>
          آیا از حذف حساب کاربری خود اطمینان دارید؟
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          این اقدام غیرقابل بازگشت است. تمام پست‌ها، نظرات، لایک‌ها و پیام‌های شما برای همیشه از سرور پاک خواهد شد.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          انصراف
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          sx={{ borderRadius: 9999, px: 3, fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'بله، حساب حذف شود'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
