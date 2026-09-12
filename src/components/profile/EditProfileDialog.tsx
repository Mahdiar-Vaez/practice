'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { User } from '@/types/api';
import { userService } from '@/services/user.service';
import { uploadService } from '@/services/upload.service';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProfileUpdated: (updatedUser: User) => void;
}

export default function EditProfileDialog({
  open,
  onClose,
  currentUser,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const [name, setName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [avatar, setAvatar] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser, open]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await uploadService.uploadFile(file);
      setAvatar(`http://localhost:5000${result.url}`);
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری تصویر پروفایل');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('نام نمی‌تواند خالی باشد');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });
      onProfileUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'خطا در ذخیره تغییرات پروفایل');
    } finally {
      setLoading(false);
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
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ fontWeight: 800, fontSize: '1.2rem' }}>ویرایش پروفایل</Box>
        <IconButton onClick={onClose} size="small" aria-label="بستن">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Avatar Upload Preview */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, position: 'relative' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt="عکس پروفایل"
              sx={{ width: 90, height: 90, border: '3px solid', borderColor: 'primary.main' }}
            />
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
              }}
              size="small"
              aria-label="تغییر عکس پروفایل"
            >
              {uploading ? <CircularProgress size={18} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarFileChange}
              />
            </IconButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="نام و نام خانوادگی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="بیوگرافی و درباره شما"
          multiline
          minRows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="آدرس تصویر آواتار (اختیاری)"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          disabled={loading}
          helperText="می‌توانید تصویر بالا را آپلود کنید یا آدرس مستقیم وارد نمایید"
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          انصراف
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || uploading}
          sx={{ borderRadius: 9999, px: 3, fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'ذخیره تغییرات'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
