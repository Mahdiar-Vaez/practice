# Design Document: Isolated Backend & Persian Authentication System

**Date:** 2026-09-11  
**Status:** Approved  
**Topic:** Isolated Backend Architecture & Persian Responsive Login System

---

## 1. Overview & Goals

The goal of this system is to provide a clean, production-grade authentication flow with:
1. A completely isolated Express + TypeScript backend inside `/backend` adopting layered architecture (Controller ➔ Service ➔ Repository ➔ Routes ➔ Middlewares) using mock data in memory.
2. End-to-end type safety and validation with **Zod** across backend endpoints and frontend forms.
3. A decoupled frontend client communicating via **Axios** with request/response interceptors for token injection and 401 handling.
4. Custom React hooks:
   - `useForm`: Reusable form state management with Zod schema validation, field errors, touched tracking, and submission state.
   - `useAuth`: Authentication lifecycle hook managing JWT tokens, user state, login, and logout.
5. Full **Persian (فارسی)** localization, RTL layout (`dir="rtl"`), and **Vazirmatn** font integration with responsive design across mobile, tablet, and desktop breakpoints.

---

## 2. Backend Architecture (`/backend`)

### 2.1 Directory Structure
```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── src/
    ├── config/
    │   └── env.ts                      # App configurations (port, secrets, origins)
    ├── types/
    │   ├── user.types.ts               # User entity and DTO types
    │   └── api.types.ts                # Standard API response interfaces
    ├── validations/
    │   └── auth.validation.ts          # Zod schemas for login and register
    ├── repositories/
    │   ├── user.repository.interface.ts# Abstract repository interface
    │   └── mock-user.repository.ts     # In-memory mock data repository with seed data
    ├── services/
    │   └── auth.service.ts             # Business logic (bcrypt compare, JWT issuance)
    ├── controllers/
    │   └── auth.controller.ts          # HTTP request/response handlers
    ├── middlewares/
    │   ├── validate.middleware.ts      # Generic Zod request validator middleware
    │   ├── auth.middleware.ts          # JWT bearer token verification
    │   └── error.middleware.ts         # Centralized Express error handler
    ├── routes/
    │   ├── auth.routes.ts              # /api/auth routes
    │   └── index.ts                    # Root API router
    ├── app.ts                          # Express application setup (CORS, JSON, routes)
    └── server.ts                       # Server bootstrap listener (port 5000)
```

### 2.2 Layer Responsibilities & Contracts

#### Data Layer (Repository)
* **`IUserRepository`**:
  * `findByEmail(email: string): Promise<User | null>`
  * `findByUsername(username: string): Promise<User | null>`
  * `findByEmailOrUsername(identifier: string): Promise<User | null>`
  * `findById(id: string): Promise<User | null>`
  * `create(userData: CreateUserDTO): Promise<User>`
* **`MockUserRepository`**:
  * In-memory array initialized with seeded demo accounts.
  * Pre-seeded demo user:
    * `id`: `"usr_demo_123"`
    * `name`: `"کاربر دمو"` (Demo User)
    * `username`: `"demo"`
    * `email`: `"demo@example.com"`
    * `password`: Hashed with bcrypt (`password123`)
    * `bio`: `"توسعه‌دهنده نرم‌افزار و کاربر آزمایشی سامانه"`
    * `avatar`: `"/avatars/demo.png"`

#### Business Logic Layer (Service)
* **`AuthService`**:
  * Dependency-injected with `IUserRepository`.
  * `login(dto: LoginDTO)`:
    * Finds user by email or username.
    * Compares password with `bcrypt.compare`.
    * Throws descriptive 401 error if credentials do not match.
    * Generates signed JWT containing `{ userId, email, username }` (valid for 7 days).
    * Returns sanitized user profile and token.
  * `register(dto: RegisterDTO)`:
    * Checks for email and username collisions (409 conflict if exists).
    * Hashes password with `bcrypt.hash`.
    * Stores user in repository and returns user and token.
  * `getProfile(userId: string)`:
    * Fetches profile by id; throws 404 if not found.

#### Presentation Layer (Controller & Routing)
* **`AuthController`**:
  * `POST /api/auth/login`: Handles login requests, calls `authService.login()`.
  * `POST /api/auth/register`: Handles registration requests, calls `authService.register()`.
  * `GET /api/auth/me`: Protected route verifying current token and returning user profile.
* **Standard Response Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "عملیات با موفقیت انجام شد"
  }
  ```

#### Middlewares
* **`validate(schema)`**: Generic middleware verifying `req.body` against Zod schemas. If validation fails, returns HTTP 400 with a map of field errors.
* **`authenticate`**: Verifies JWT Bearer token from the `Authorization` header, attaching `req.user`.
* **`errorHandler`**: Catches unhandled exceptions and returns standardized error responses without leaking stack traces.

---

## 3. Frontend Architecture (Next.js 16 + Material UI)

### 3.1 Localization & Persian Typography
1. **Google Vazirmatn Font**:
   * Imported via `next/font/google` in `src/app/layout.tsx`.
   * Set as global CSS variable `--font-vazir` and applied to MUI typography (`fontFamily: "var(--font-vazir), 'Vazirmatn', sans-serif"`).
2. **Direction & HTML**:
   * `<html lang="fa" dir="rtl">` in `src/app/layout.tsx`.
3. **MUI RTL Support**:
   * Integration of `stylis` and `stylis-plugin-rtl` via Emotion cache provider in `src/theme/ThemeRegistry.tsx`.
   * Theme configuration with `direction: 'rtl'`.

### 3.2 API Layer & Interceptors (`src/lib/api.ts`)
* Configured Axios instance with `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'`.
* **Request Interceptor**:
  * Reads auth token from `localStorage.getItem('auth_token')`.
  * Injects `Authorization: Bearer <token>` into request headers.
* **Response Interceptor**:
  * Extracts `response.data`.
  * Intercepts `401 Unauthorized`: clears stored token, resets auth context, and dispatches an auth expired event.
  * Formats error responses into user-friendly Persian error messages.

### 3.3 Custom Hooks

#### `useForm<T>` (`src/hooks/useForm.ts`)
A generic custom hook for form state and Zod validation:
* **Parameters**:
  * `schema`: Zod object schema.
  * `initialValues`: Initial record values.
  * `onSubmit`: Async handler `(values: T) => Promise<void>`.
* **Returned Properties**:
  * `values`: Current form state `T`.
  * `errors`: Partial record of field validation error messages.
  * `touched`: Record of touched fields.
  * `isSubmitting`: Boolean indicating ongoing submission.
  * `serverError`: Root-level error message from backend.
  * `handleChange(field)`: Change handler for inputs.
  * `handleBlur(field)`: Blur handler to trigger field-level validation.
  * `handleSubmit(e)`: Form submit handler with full schema validation.
  * `setFieldValue(field, value)`: Direct value setter (for demo quick-fill).
  * `resetForm()`: Reset values and clear errors.

#### `useAuth` (`src/context/AuthContext.tsx` & `src/hooks/useAuth.ts`)
* Exposes:
  * `user`: Currently logged in user object or `null`.
  * `token`: Active JWT token or `null`.
  * `isAuthenticated`: Computed boolean.
  * `isLoading`: Initial auth check loading state.
  * `login(credentials)`: Calls API, stores token, updates user, redirects to home `/`.
  * `logout()`: Clears storage, resets state, redirects to `/login`.

### 3.4 Responsive Persian Login Page (`src/app/login/page.tsx`)
* **Breakpoints & Layout**:
  * Mobile (`xs` < 600px): Fluid full-screen container with comfortable padding (`px: 2`, `py: 3`), minimum 48px touch targets for buttons and inputs.
  * Tablet & Desktop (`sm+` >= 600px): Centered elevation card, max-width `440px`, border divider, subtle shadow.
* **UI Elements**:
  * X logo centered at top.
  * Persian header: **«ورود به توییتر / X»** and subtitle.
  * Single identifier input for **«ایمیل یا نام کاربری»** with clear error display.
  * Password input with an RTL-aware toggle to show/hide password text.
  * Submit button: **«ورود به حساب کاربری»** with loading spinner.
  * Quick-fill button: **«تکمیل با حساب آزمایشی (Demo)»** that fills `demo@example.com` / `password123`.
  * Server error Alert banner in case of failed authentication.
  * Link to register and forgot password in Persian.

---

## 4. End-to-End Validation Schemas (Zod)

### 4.1 Login Schema
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: 'ایمیل یا نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .max(100, { message: 'ایمیل یا نام کاربری بیش از حد طولانی است' }),
  password: z
    .string()
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
    .max(100, { message: 'رمز عبور بیش از حد طولانی است' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 4.2 Register Schema
```typescript
export const registerSchema = z.object({
  name: z.string().min(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' }),
  username: z
    .string()
    .min(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و زیرخط باشد' }),
  email: z.string().email({ message: 'لطفاً یک ایمیل معتبر وارد کنید' }),
  password: z.string().min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }),
});
```

---

## 5. Verification Plan

1. **Backend Verification**:
   * Run standalone backend server with `tsx` / `node`.
   * Test `/api/auth/login` with valid credentials (`demo@example.com` / `password123`) -> 200 OK + JWT.
   * Test `/api/auth/login` with invalid credentials -> 401 Unauthorized with Persian error message.
   * Test `/api/auth/login` with invalid schema payload -> 400 Bad Request with Zod validation details.
   * Test `/api/auth/me` with Bearer token -> 200 OK with user profile.
2. **Frontend Verification**:
   * Test RTL layout and Vazirmatn font rendering.
   * Test client-side Zod validation on touch/blur and submit (verifying error messages display in Persian).
   * Test one-click quick-fill demo button.
   * Test successful login: inspect Axios interceptor, check `localStorage`, verify redirect to `/`.
   * Test responsive layout across mobile (<600px), tablet (768px), and desktop (1200px) viewport widths.
