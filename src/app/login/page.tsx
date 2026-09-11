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
  Tabs,
  Tab,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ApiResponse, LoginResponseData } from '@/types/api';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z.string().min(1, 'ایمیل یا نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    username: z
      .string()
      .min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد')
      .regex(/^[a-zA-Z0-9_]+$/, 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و زیرخط باشد'),
    email: z.string().email('فرمت ایمیل نامعتبر است'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [tab, setTab] = React.useState<0 | 1>(0); // 0: Login, 1: Register
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = React.useState({
    identifier: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = React.useState<Record<string, string>>({});

  // Register form state
  const [registerForm, setRegisterForm] = React.useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registerErrors, setRegisterErrors] = React.useState<Record<string, string>>({});

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setLoginErrors(fieldErrors);
      return;
    }

    setLoginErrors({});
    setLoading(true);

    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', loginForm);
      if (response.data.success && response.data.data) {
        login(response.data.data);
        router.push('/');
      } else {
        setServerError(response.data.message || 'اطلاعات ورود اشتباه است');
      }
    } catch (err: any) {
      setServerError(err.message || 'ایمیل/نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const result = registerSchema.safeParse(registerForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setRegisterErrors(fieldErrors);
      return;
    }

    setRegisterErrors({});
    setLoading(true);

    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/register', {
        name: registerForm.name,
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });

      if (response.data.success && response.data.data) {
        login(response.data.data);
        router.push('/');
      } else {
        setServerError(response.data.message || 'ثبت‌نام با خطا مواجه شد');
      }
    } catch (err: any) {
      setServerError(err.message || 'خطا در ثبت‌نام؛ لطفاً اطلاعات ورودی را بررسی کنید');
    } finally {
      setLoading(false);
    }
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
      <Container maxWidth="xs" sx={{ width: '100%', px: { xs: 0, sm: 2 } }}>
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
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
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
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={tab}
            onChange={(_e, v) => {
              setTab(v);
              setServerError(null);
            }}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab icon={<PersonOutlineIcon />} iconPosition="start" label="ورود به حساب" />
            <Tab icon={<HowToRegIcon />} iconPosition="start" label="ثبت‌نام حساب" />
          </Tabs>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {serverError}
            </Alert>
          )}

          {/* Tab 0: Login */}
          {tab === 0 && (
            <Box component="form" onSubmit={handleLoginSubmit} noValidate>
              <TextField
                fullWidth
                id="identifier"
                name="identifier"
                label="ایمیل یا نام کاربری"
                value={loginForm.identifier}
                onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                error={Boolean(loginErrors.identifier)}
                helperText={loginErrors.identifier}
                disabled={loading}
                autoComplete="username"
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="رمز عبور"
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                error={Boolean(loginErrors.password)}
                helperText={loginErrors.password}
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        aria-label="نمایش/مخفی‌سازی رمز عبور"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 9999,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'ورود به حساب'}
              </Button>
            </Box>
          )}

          {/* Tab 1: Register */}
          {tab === 1 && (
            <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
              <TextField
                fullWidth
                label="نام و نام خانوادگی"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                error={Boolean(registerErrors.name)}
                helperText={registerErrors.name}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="نام کاربری (انگلیسی)"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                error={Boolean(registerErrors.username)}
                helperText={registerErrors.username}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="ایمیل"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                error={Boolean(registerErrors.email)}
                helperText={registerErrors.email}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="رمز عبور"
                type={showPassword ? 'text' : 'password'}
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                error={Boolean(registerErrors.password)}
                helperText={registerErrors.password}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="تکرار رمز عبور"
                type={showPassword ? 'text' : 'password'}
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                error={Boolean(registerErrors.confirmPassword)}
                helperText={registerErrors.confirmPassword}
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 9999,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'ثبت‌نام و ورود'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
            با ورود یا ثبت‌نام، شرایط خدمات و خط مشی رازداری سامانه را می‌پذیرید.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
