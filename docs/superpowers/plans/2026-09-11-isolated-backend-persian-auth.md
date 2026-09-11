# Isolated Backend & Persian Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a completely isolated Express + TypeScript layered backend with in-memory mock repository, JWT authentication, and Zod validation; and integrate it with a responsive Persian RTL Next.js login page using Axios interceptors, a custom `useForm` Zod validation hook, and `useAuth` hook.

**Architecture:** The backend is standalone in `/backend` using a strict layered architecture (Repository ➔ Service ➔ Controller ➔ Routes ➔ Middlewares) with mock data. The frontend communicates with this backend through an Axios client equipped with request/response interceptors, manages form state through a reusable custom `useForm` hook with Zod schema validation, and renders a fully responsive Persian RTL interface with Google Vazirmatn font.

**Tech Stack:** 
- Backend: Express, TypeScript, Zod, jsonwebtoken, bcryptjs, cors, dotenv, tsx, vitest/jest
- Frontend: Next.js 16, React 19, Material-UI 6, Axios, Zod, stylis, stylis-plugin-rtl, Vazirmatn font (`next/font/google`)

**Spec:** [`docs/superpowers/specs/2026-09-11-isolated-backend-persian-auth-design.md`](file:///E:/agenting-practice/practice/docs/superpowers/specs/2026-09-11-isolated-backend-persian-auth-design.md)

## Global Constraints
- Backend directory MUST be completely isolated inside `/backend` with its own `package.json` and `tsconfig.json`.
- Backend MUST use layered architecture: repository, service, controller, routes, middleware, validation.
- Backend MUST use mock in-memory data seeded with demo user (`demo@example.com` / `password123`).
- Frontend MUST use Axios with request interceptor for JWT injection and response interceptor for 401 handling.
- Frontend MUST use custom hooks for form state (`useForm` with Zod) and auth state (`useAuth`).
- Language MUST be Persian with Vazirmatn font, RTL layout (`dir="rtl"`), and responsive styling across mobile and desktop.

---

### Task 1: Backend Scaffolding & Configuration

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/.env`
- Create: `backend/.gitignore`
- Create: `backend/src/config/env.ts`

**Interfaces:**
- Produces: `env` config object (`PORT`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`) in `backend/src/config/env.ts`

- [ ] **Step 1: Create `backend/package.json` with scripts and dependencies**

```json
{
  "name": "twitter-clone-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^22.13.4",
    "tsx": "^4.19.3",
    "typescript": "^5.7.3",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `backend/.env.example` and `backend/.env`**

```env
PORT=5000
JWT_SECRET=super_secret_jwt_key_for_practice_twitter_clone_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

- [ ] **Step 4: Create `backend/src/config/env.ts`**

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
```

- [ ] **Step 5: Run `npm install` inside `backend/`**

Run: `cd backend && npm install`
Expected: Success with node_modules installed.

- [ ] **Step 6: Commit backend scaffolding**

```bash
git add backend/
git commit -m "chore(backend): scaffold isolated backend package and config"
```

---

### Task 2: Backend Types, Validation Schemas & Mock Data Repository

**Files:**
- Create: `backend/src/types/user.types.ts`
- Create: `backend/src/types/api.types.ts`
- Create: `backend/src/validations/auth.validation.ts`
- Create: `backend/src/repositories/user.repository.interface.ts`
- Create: `backend/src/repositories/mock-user.repository.ts`
- Test: `backend/src/repositories/mock-user.repository.test.ts`

**Interfaces:**
- Produces: `loginSchema`, `registerSchema`, `IUserRepository`, `MockUserRepository`

- [ ] **Step 1: Write failing test for `MockUserRepository`**

```typescript
// backend/src/repositories/mock-user.repository.test.ts
import { describe, it, expect } from 'vitest';
import { MockUserRepository } from './mock-user.repository.js';

describe('MockUserRepository', () => {
  it('should find seeded demo user by email or username', async () => {
    const repo = new MockUserRepository();
    const byEmail = await repo.findByEmailOrUsername('demo@example.com');
    const byUsername = await repo.findByEmailOrUsername('demo');
    
    expect(byEmail).toBeDefined();
    expect(byUsername).toBeDefined();
    expect(byEmail?.id).toBe(byUsername?.id);
    expect(byEmail?.name).toBe('کاربر دمو');
  });

  it('should create and store a new user', async () => {
    const repo = new MockUserRepository();
    const newUser = await repo.create({
      name: 'تست',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    expect(newUser.id).toBeDefined();
    const found = await repo.findById(newUser.id);
    expect(found?.username).toBe('testuser');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/repositories/mock-user.repository.test.ts` inside `backend/`
Expected: FAIL ("Cannot find module ./mock-user.repository.js")

- [ ] **Step 3: Create types, validation schemas, and `MockUserRepository`**

```typescript
// backend/src/types/user.types.ts
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string; // bcrypt hash
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, 'password'>;

export interface CreateUserDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
}
```

```typescript
// backend/src/types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}
```

```typescript
// backend/src/validations/auth.validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'ایمیل یا نام کاربری الزامی است' })
    .min(3, { message: 'ایمیل یا نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .max(100, { message: 'ایمیل یا نام کاربری بیش از حد طولانی است' }),
  password: z
    .string({ required_error: 'رمز عبور الزامی است' })
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
    .max(100, { message: 'رمز عبور بیش از حد طولانی است' }),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'نام الزامی است' })
    .min(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' }),
  username: z
    .string({ required_error: 'نام کاربری الزامی است' })
    .min(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد' }),
  email: z
    .string({ required_error: 'ایمیل الزامی است' })
    .email({ message: 'لطفاً یک ایمیل معتبر وارد کنید' }),
  password: z
    .string({ required_error: 'رمز عبور الزامی است' })
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

```typescript
// backend/src/repositories/user.repository.interface.ts
import { User, CreateUserDTO } from '../types/user.types.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmailOrUsername(identifier: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserDTO): Promise<User>;
  getAll(): Promise<User[]>;
}
```

```typescript
// backend/src/repositories/mock-user.repository.ts
import bcrypt from 'bcryptjs';
import { User, CreateUserDTO } from '../types/user.types.js';
import { IUserRepository } from './user.repository.interface.js';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    this.seedUsers();
  }

  private seedUsers(): void {
    // Pre-hashed bcrypt for 'password123'
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    this.users.push({
      id: 'usr_demo_123',
      name: 'کاربر دمو',
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      bio: 'توسعه‌دهنده نرم‌افزار و کاربر آزمایشی سامانه',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user ? { ...user } : null;
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const cleanId = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async getAll(): Promise<User[]> {
    return [...this.users];
  }
}

export const userRepository = new MockUserRepository();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/repositories/mock-user.repository.test.ts` inside `backend/`
Expected: PASS (2 tests pass)

- [ ] **Step 5: Commit repository and validation layer**

```bash
git add backend/src/types backend/src/validations backend/src/repositories
git commit -m "feat(backend): add domain types, zod validation schemas and mock user repository"
```

---

### Task 3: Backend Service, Middlewares, Controller & API Routes

**Files:**
- Create: `backend/src/services/auth.service.ts`
- Create: `backend/src/middlewares/validate.middleware.ts`
- Create: `backend/src/middlewares/auth.middleware.ts`
- Create: `backend/src/middlewares/error.middleware.ts`
- Create: `backend/src/controllers/auth.controller.ts`
- Create: `backend/src/routes/auth.routes.ts`
- Create: `backend/src/routes/index.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Test: `backend/src/services/auth.service.test.ts`

**Interfaces:**
- Consumes: `userRepository`, `loginSchema`, `registerSchema`, `env`
- Produces: Express API running on port 5000 with endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/auth/me`

- [ ] **Step 1: Write test for `AuthService`**

```typescript
// backend/src/services/auth.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';

describe('AuthService', () => {
  let service: AuthService;
  let repo: MockUserRepository;

  beforeEach(() => {
    repo = new MockUserRepository();
    service = new AuthService(repo);
  });

  it('should authenticate demo user with correct credentials', async () => {
    const result = await service.login({
      identifier: 'demo@example.com',
      password: 'password123',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('demo@example.com');
    expect(result.user.name).toBe('کاربر دمو');
  });

  it('should throw error for invalid password', async () => {
    await expect(
      service.login({
        identifier: 'demo@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('اطلاعات ورود نامعتبر است');
  });

  it('should throw error for non-existent user', async () => {
    await expect(
      service.login({
        identifier: 'unknown@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('اطلاعات ورود نامعتبر است');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/auth.service.test.ts` inside `backend/`
Expected: FAIL ("Cannot find module ./auth.service.js")

- [ ] **Step 3: Implement `AuthService`**

```typescript
// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { SafeUser } from '../types/user.types.js';
import { LoginInput, RegisterInput } from '../validations/auth.validation.js';
import { env } from '../config/env.js';

export interface AuthResult {
  token: string;
  user: SafeUser;
}

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  private sanitizeUser(user: any): SafeUser {
    const { password, ...safe } = user;
    return safe;
  }

  private generateToken(user: SafeUser): string {
    return jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmailOrUsername(input.identifier);
    if (!user) {
      const error: any = new Error('اطلاعات ورود نامعتبر است');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      const error: any = new Error('اطلاعات ورود نامعتبر است');
      error.statusCode = 401;
      throw error;
    }

    const safeUser = this.sanitizeUser(user);
    const token = this.generateToken(safeUser);
    return { token, user: safeUser };
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      const error: any = new Error('این ایمیل قبلاً در سامانه ثبت شده است');
      error.statusCode = 409;
      throw error;
    }

    const existingUsername = await this.userRepository.findByUsername(input.username);
    if (existingUsername) {
      const error: any = new Error('این نام کاربری قبلاً انتخاب شده است');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const newUser = await this.userRepository.create({
      name: input.name,
      username: input.username,
      email: input.email,
      password: hashedPassword,
    });

    const safeUser = this.sanitizeUser(newUser);
    const token = this.generateToken(safeUser);
    return { token, user: safeUser };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      throw error;
    }
    return this.sanitizeUser(user);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/auth.service.test.ts` inside `backend/`
Expected: PASS (3 tests pass)

- [ ] **Step 5: Implement middlewares, controller, routes, app and server**

Create `backend/src/middlewares/validate.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          errors[field] = err.message;
        });
        return res.status(400).json({
          success: false,
          message: 'داده‌های ارسالی نامعتبر است',
          errors,
        });
      }
      next(error);
    }
  };
};
```

Create `backend/src/middlewares/auth.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'توکن دسترسی معتبر ارائه نشده است',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'توکن دسترسی منقضی شده یا نامعتبر است',
    });
  }
};
```

Create `backend/src/middlewares/error.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'خطای داخلی سرور رخ داده است';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
```

Create `backend/src/controllers/auth.controller.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { userRepository } from '../repositories/mock-user.repository.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const authService = new AuthService(userRepository);

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'ورود با موفقیت انجام شد',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'ثبت‌نام با موفقیت انجام شد',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

Create `backend/src/routes/auth.routes.ts`:
```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

export default router;
```

Create `backend/src/routes/index.ts`:
```typescript
import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
```

Create `backend/src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

export default app;
```

Create `backend/src/server.ts`:
```typescript
import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Isolated Backend server running on http://localhost:${env.PORT}`);
});

export default server;
```

- [ ] **Step 6: Commit complete backend implementation**

```bash
git add backend/src/
git commit -m "feat(backend): complete layered backend with auth service, controller and routes"
```

---

### Task 4: Frontend Dependencies & RTL / Persian Typography Setup

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx`
- Modify: `src/theme/ThemeRegistry.tsx`
- Modify: `src/theme/theme.ts`

**Interfaces:**
- Produces: Global Persian Vazirmatn font, RTL HTML element `<html lang="fa" dir="rtl">`, Emotion RTL stylis caching.

- [ ] **Step 1: Install frontend dependencies (`axios`, `zod`, `stylis`, `stylis-plugin-rtl`)**

Run: `npm install axios zod stylis stylis-plugin-rtl` in root.
Run: `npm install -D @types/stylis` in root.
Expected: Dependencies installed in root package.json.

- [ ] **Step 2: Update `src/app/layout.tsx` with Vazirmatn font and RTL direction**

```typescript
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import ThemeRegistry from '@/theme/ThemeRegistry';

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-vazir',
});

export const metadata: Metadata = {
  title: 'توییتر / X',
  description: 'طراحی صفحه توییتر با نکست جی‌اس ۱۶ و متریال یو‌آی',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update `src/theme/ThemeRegistry.tsx` with RTL Emotion cache and Stylis plugin**

```typescript
'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { getTwitterTheme } from './theme';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

export const ColorModeContext = React.createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
  setColorMode: () => {},
});

export function useColorMode() {
  const context = React.useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within ThemeRegistry');
  }
  return context;
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ColorMode>('dark');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedMode = localStorage.getItem('twitter_color_mode') as ColorMode | null;
      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setMode(prefersDark ? 'dark' : 'light');
      }
    } catch {
      // fallback
    }
    setMounted(true);
  }, []);

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'dark' ? 'light' : 'dark';
          try {
            localStorage.setItem('twitter_color_mode', nextMode);
          } catch {}
          return nextMode;
        });
      },
      setColorMode: (newMode: ColorMode) => {
        setMode(newMode);
        try {
          localStorage.setItem('twitter_color_mode', newMode);
        } catch {}
      },
    }),
    [mode]
  );

  const theme = React.useMemo(() => getTwitterTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider
      options={{
        key: 'muirtl',
        stylisPlugins: [prefixer, rtlPlugin],
        enableCssLayer: true,
      }}
    >
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
```

- [ ] **Step 4: Update `src/theme/theme.ts` to include RTL direction and Vazirmatn font**

Set `direction: 'rtl'`, typography `fontFamily: "var(--font-vazir), 'Vazirmatn', -apple-system, sans-serif"`.

- [ ] **Step 5: Run Next.js build or dev check**

Run: `npm run build`
Expected: Build succeeds with RTL and Vazir font configured.

- [ ] **Step 6: Commit Persian RTL typography**

```bash
git add package.json package-lock.json src/app/layout.tsx src/theme/
git commit -m "feat(frontend): configure Persian RTL layout and Vazirmatn font"
```

---

### Task 5: Frontend Axios Client with Interceptors

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/types/api.ts`

**Interfaces:**
- Produces: `api` Axios instance configured with request and response interceptors.

- [ ] **Step 1: Create `src/types/api.ts`**

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}
```

- [ ] **Step 2: Create `src/lib/api.ts` with Axios interceptors**

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and format error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    
    // Normalize Persian error message
    const customMessage = error.response?.data?.message || 'خطایی در برقراری ارتباط با سرور رخ داد';
    const normalizedError = new Error(customMessage);
    (normalizedError as any).response = error.response;
    return Promise.reject(normalizedError);
  }
);

export default api;
```

- [ ] **Step 3: Commit Axios interceptor configuration**

```bash
git add src/lib/api.ts src/types/api.ts
git commit -m "feat(frontend): create axios client with request and response interceptors"
```

---

### Task 6: Custom Hooks: `useForm` (Zod Validation) & `useAuth` Context

**Files:**
- Create: `src/hooks/useForm.ts`
- Create: `src/context/AuthContext.tsx`
- Create: `src/hooks/useAuth.ts`
- Modify: `src/app/layout.tsx` (wrap with `AuthProvider`)

**Interfaces:**
- Consumes: `api`, `loginSchema`
- Produces: `useForm<T>`, `AuthProvider`, `useAuth()`

- [ ] **Step 1: Implement `src/hooks/useForm.ts`**

```typescript
'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface UseFormOptions<T extends Record<string, any>> {
  schema: ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateField = useCallback(
    (field: keyof T, val: any) => {
      try {
        schema.parse({ ...values, [field]: val });
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      } catch (err) {
        if (err instanceof ZodError) {
          const fieldIssue = err.issues.find((issue) => issue.path[0] === field);
          setErrors((prev) => ({
            ...prev,
            [field]: fieldIssue ? fieldIssue.message : undefined,
          }));
        }
      }
    },
    [schema, values]
  );

  const handleChange = useCallback(
    (field: keyof T) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        setServerError(null);
        if (touched[field]) {
          validateField(field, value);
        }
      },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, values[field]);
    },
    [validateField, values]
  );

  const setFieldValue = useCallback((field: keyof T, val: any) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setServerError(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      setServerError(null);

      // Mark all touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach((k) => {
        allTouched[k as keyof T] = true;
      });
      setTouched(allTouched);

      try {
        const validatedValues = schema.parse(values);
        setIsSubmitting(true);
        await onSubmit(validatedValues);
      } catch (err: any) {
        if (err instanceof ZodError) {
          const fieldErrors: Partial<Record<keyof T, string>> = {};
          err.issues.forEach((issue) => {
            const path = issue.path[0] as keyof T;
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setServerError(err.message || 'خطایی در ثبت فرم رخ داد');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [schema, values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setServerError(null);
    setIsSubmitting(false);
  }, [initialValues]);

  return {
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
    resetForm,
  };
}
```

- [ ] **Step 2: Implement `src/context/AuthContext.tsx` and `src/hooks/useAuth.ts`**

Create `src/context/AuthContext.tsx`:
```typescript
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginResponseData, ApiResponse } from '@/types/api';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponseData) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback((data: LoginResponseData) => {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
          if (res.data.success && res.data.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('auth_user', JSON.stringify(res.data.data.user));
          }
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

Create `src/hooks/useAuth.ts`:
```typescript
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 3: Wrap `RootLayout` in `src/app/layout.tsx` with `AuthProvider`**

- [ ] **Step 4: Commit custom form and auth hooks**

```bash
git add src/hooks/ src/context/ src/app/layout.tsx
git commit -m "feat(frontend): implement useForm zod hook and useAuth context"
```

---

### Task 7: Responsive Persian Login Page Implementation

**Files:**
- Create: `src/validations/login.schema.ts`
- Modify: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `useForm`, `useAuth`, `api`, `loginSchema`
- Produces: Fully responsive, RTL Persian login page with demo user quick-fill, visibility toggle, error display, and redirect.

- [ ] **Step 1: Create `src/validations/login.schema.ts` for frontend**

```typescript
import { z } from 'zod';

export const loginFormSchema = z.object({
  identifier: z
    .string({ required_error: 'لطفاً ایمیل یا نام کاربری را وارد کنید' })
    .min(3, { message: 'ایمیل یا نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .max(100, { message: 'ایمیل یا نام کاربری بیش از حد طولانی است' }),
  password: z
    .string({ required_error: 'لطفاً رمز عبور را وارد کنید' })
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
    .max(100, { message: 'رمز عبور بیش از حد طولانی است' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
```

- [ ] **Step 2: Implement responsive Persian `LoginPage` in `src/app/login/page.tsx`**

Include:
- Responsive container (`xs`: fluid full width, `sm+`: centered card 440px max-width).
- Persian typography using Vazirmatn.
- X logo and Persian titles: **«ورود به توییتر / X»**.
- RTL-aware show/hide password toggle (Eye/EyeOff icons).
- Quick-fill demo button: **«تکمیل با کاربر آزمایشی (Demo)»** (sets `demo@example.com` / `password123`).
- Alert message for server errors.
- Loading spinner on submit button during `isSubmitting`.
- Redirection to `/` upon successful login.

- [ ] **Step 3: Run Next.js build and verify no compilation errors**

Run: `npm run build`
Expected: Successfully compiles with zero TypeScript or build errors.

- [ ] **Step 4: Commit login page**

```bash
git add src/validations/login.schema.ts src/app/login/page.tsx
git commit -m "feat(frontend): implement responsive Persian login page with zod validation"
```

---

### Task 8: End-to-End Verification & Documentation

**Files:**
- Create: `backend/README.md`
- Modify: `README.md`
- Modify: `package.json` (add convenience scripts `npm run backend` and `npm run dev:all`)

- [ ] **Step 1: Add root convenience scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "backend": "cd backend && npm run dev",
  "backend:test": "cd backend && npm run test"
}
```

- [ ] **Step 2: Start backend server and test endpoints with curl / fetch**

1. Run backend unit tests: `npm run backend:test`
2. Launch backend server and test `POST /api/auth/login` with demo credentials.
3. Test invalid credentials returns 401 with Persian message.
4. Test invalid body returns 400 with Zod field errors.

- [ ] **Step 3: Create `backend/README.md` explaining layered architecture and API**

- [ ] **Step 4: Commit documentation and root scripts**

```bash
git add package.json backend/README.md README.md
git commit -m "docs: add backend documentation and root convenience scripts"
```
