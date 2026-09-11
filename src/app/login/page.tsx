'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Chip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { loginFormSchema, LoginFormValues } from '@/validations/login.schema';
import api from '@/lib/api';
import { ApiResponse, LoginResponseData } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    serverError,
    setServerError,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm<LoginFormValues>({
    schema: loginFormSchema,
    initialValues: {
      identifier: '',
      password: '',
    },
    onSubmit: async (formValues) => {
      try {
        const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', formValues);
        if (response.data.success && response.data.data) {
          login(response.data.data);
          router.push('/');
        } else {
          setServerError(response.data.message || 'ورود ناموفق بود');
        }
      } catch (err: any) {
        setServerError(err.message || 'ایمیل/نام کاربری یا رمز عبور اشتباه است');
      }
    },
  });

  const handleFillDemo = () => {
    setFieldValue('identifier', 'demo@example.com');
    setFieldValue('password', 'password123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 6 },
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          width: '100%',
          px: { xs: 0, sm: 2 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: { xs: 3, sm: 4 },
            p: { xs: 3, sm: 4.5 },
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: {
              xs: 'none',
              sm: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          {/* Top Logo & Back to Home */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <IconButton size="small" title="بازگشت به خانه">
                <ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />
              </IconButton>
            </Link>

            {/* X Logo */}
            <Box
              sx={{
                width: 42,
                height: 42,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Box>

            <Box sx={{ width: 34 }} />
          </Box>

          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1,
              textAlign: 'center',
              fontSize: { xs: '1.35rem', sm: '1.6rem' },
            }}
          >
            ورود به توییتر / X
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 3,
              textAlign: 'center',
            }}
          >
            برای ادامه، لطفاً اطلاعات حساب خود را وارد نمایید
          </Typography>

          {/* Quick-fill Demo Account Banner */}
          <Box
            sx={{
              mb: 3,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'action.hover',
              border: '1px dashed',
              borderColor: 'primary.main',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label="حساب آزمایشی آماده"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              نام کاربری: <b>demo@example.com</b> | رمز: <b>password123</b>
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleFillDemo}
              startIcon={<PersonOutlineIcon />}
              sx={{
                borderRadius: 4,
                fontSize: '0.8125rem',
                py: 0.5,
                px: 2,
              }}
            >
              تکمیل فرم با کاربر دمو
            </Button>
          </Box>

          {/* Server Error Alert */}
          {serverError && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                fontSize: '0.875rem',
              }}
            >
              {serverError}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Identifier input */}
            <TextField
              fullWidth
              id="identifier"
              name="identifier"
              label="ایمیل یا نام کاربری"
              placeholder="demo@example.com یا demo"
              value={values.identifier}
              onChange={handleChange('identifier')}
              onBlur={handleBlur('identifier')}
              error={Boolean(touched.identifier && errors.identifier)}
              helperText={touched.identifier && errors.identifier}
              margin="normal"
              autoComplete="username"
              disabled={isSubmitting}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                },
              }}
            />

            {/* Password input */}
            <TextField
              fullWidth
              id="password"
              name="password"
              label="رمز عبور"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
              margin="normal"
              autoComplete="current-password"
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="تغییر نمایش رمز عبور"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                },
              }}
            />

            {/* Submit button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSubmitting}
              sx={{
                py: 1.4,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '1rem',
                minHeight: 48,
                mb: 2,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'ورود به حساب کاربری'
              )}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.2,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 3,
              }}
            >
              فراموشی رمز عبور؟
            </Button>

            <Divider sx={{ mb: 3, color: 'text.secondary', fontSize: '0.8125rem' }}>
              یا
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                حساب کاربری ندارید؟{' '}
                <Link
                  href="/signup"
                  style={{
                    color: '#1d9bf0',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  ثبت‌نام کنید
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
