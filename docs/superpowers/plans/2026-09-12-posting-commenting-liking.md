# Posting, Commenting & Liking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full posting, commenting, and liking functionality with a layered Express backend using a custom `HandleError` class and mock repository, and integrate it with Next.js frontend services, an interactive Persian comments modal, and optimistic UI updates with automatic rollback when the backend is offline.

**Architecture:** 
- Backend: Standalone layered architecture (`HandleError` ➔ `MockTweetRepository` ➔ `TweetService` ➔ `TweetController` ➔ `TweetRoutes` ➔ Zod).
- Frontend: Decoupled service layer (`src/services/tweet.service.ts`) using Axios interceptors; optimistic UI mutations with rollback for likes, posts, and replies; Persian RTL comments dialog; and Snackbar error notifications.

**Tech Stack:** Express, TypeScript, Zod, Vitest, Next.js 16, React 19, Material-UI 6, Axios.

**Spec:** [`docs/superpowers/specs/2026-09-12-posting-commenting-liking-design.md`](file:///E:/agenting-practice/practice/docs/superpowers/specs/2026-09-12-posting-commenting-liking-design.md)

## Global Constraints
- Backend MUST use a custom `HandleError` class extending `Error` with `statusCode`, `isOperational`, and Persian messages.
- Backend MUST be layered: repository, service, controller, routes, validations.
- Frontend MUST use a dedicated service layer (`src/services/tweet.service.ts`) for all API calls.
- Frontend MUST handle state optimistically and cleanly roll back when the backend is offline or returns an error.
- All UI strings, comments modal, and error messages MUST be in Persian.

---

### Task 1: Backend `HandleError` Class & Global Error Middleware Integration

**Files:**
- Create: `backend/src/errors/handle-error.ts`
- Modify: `backend/src/middlewares/error.middleware.ts`
- Test: `backend/src/errors/handle-error.test.ts`

**Interfaces:**
- Produces: `HandleError` class with factory methods (`badRequest`, `unauthorized`, `notFound`, `internal`)

- [ ] **Step 1: Write test for `HandleError`**

```typescript
// backend/src/errors/handle-error.test.ts
import { describe, it, expect } from 'vitest';
import { HandleError } from './handle-error.js';

describe('HandleError', () => {
  it('should create an operational error with proper status code and message', () => {
    const error = new HandleError('خطای تست', 400);
    expect(error.message).toBe('خطای تست');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('should create notFound error with 404', () => {
    const error = HandleError.notFound('پست یافت نشد');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('پست یافت نشد');
  });

  it('should create unauthorized error with 401', () => {
    const error = HandleError.unauthorized();
    expect(error.statusCode).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/errors/handle-error.test.ts` inside `backend/`
Expected: FAIL ("Cannot find module ./handle-error.js")

- [ ] **Step 3: Implement `HandleError` in `backend/src/errors/handle-error.ts`**

```typescript
export class HandleError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string>;

  constructor(message: string, statusCode: number = 400, errors?: Record<string, string>) {
    super(message);
    this.name = 'HandleError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string>) {
    return new HandleError(message, 400, errors);
  }

  static unauthorized(message: string = 'برای دسترسی به این بخش لطفاً وارد شوید') {
    return new HandleError(message, 401);
  }

  static notFound(message: string = 'آیتم مورد نظر یافت نشد') {
    return new HandleError(message, 404);
  }

  static internal(message: string = 'خطای غیرمنتظره سرور رخ داده است') {
    return new HandleError(message, 500);
  }
}
```

- [ ] **Step 4: Update `backend/src/middlewares/error.middleware.ts`**

Support `HandleError` directly:
```typescript
import { Request, Response, NextFunction } from 'express';
import { HandleError } from '../errors/handle-error.js';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HandleError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'خطای داخلی سرور رخ داده است';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/errors/handle-error.test.ts` inside `backend/`
Expected: PASS

- [ ] **Step 6: Commit Task 1**

```bash
git add backend/src/errors/ backend/src/middlewares/error.middleware.ts
git commit -m "feat(backend): implement HandleError class and update error middleware"
```

---

### Task 2: Backend Tweet, Comment & Like Types, Validations & Mock Repository

**Files:**
- Create: `backend/src/types/tweet.types.ts`
- Create: `backend/src/validations/tweet.validation.ts`
- Create: `backend/src/repositories/tweet.repository.interface.ts`
- Create: `backend/src/repositories/mock-tweet.repository.ts`
- Test: `backend/src/repositories/mock-tweet.repository.test.ts`

**Interfaces:**
- Produces: `ITweetRepository`, `MockTweetRepository`, `createTweetSchema`, `createCommentSchema`

- [ ] **Step 1: Write test for `MockTweetRepository`**

```typescript
// backend/src/repositories/mock-tweet.repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MockTweetRepository } from './mock-tweet.repository.js';

describe('MockTweetRepository', () => {
  let repo: MockTweetRepository;

  beforeEach(() => {
    repo = new MockTweetRepository();
  });

  it('should return seeded tweets', async () => {
    const tweets = await repo.findAll();
    expect(tweets.length).toBeGreaterThanOrEqual(3);
  });

  it('should create a new tweet', async () => {
    const tweet = await repo.create({
      authorId: 'usr_demo_123',
      content: 'پست جدید تستی',
    });

    expect(tweet.id).toBeDefined();
    expect(tweet.content).toBe('پست جدید تستی');
  });

  it('should toggle like and update likesCount', async () => {
    const tweets = await repo.findAll();
    const tweetId = tweets[0].id;
    const initialLikes = tweets[0].likesCount;

    const likeResult = await repo.toggleLike(tweetId, 'usr_demo_123');
    expect(likeResult.liked).toBe(true);
    expect(likeResult.count).toBe(initialLikes + 1);

    const unlikeResult = await repo.toggleLike(tweetId, 'usr_demo_123');
    expect(unlikeResult.liked).toBe(false);
    expect(unlikeResult.count).toBe(initialLikes);
  });

  it('should add comment and update commentsCount', async () => {
    const tweets = await repo.findAll();
    const tweetId = tweets[0].id;
    const initialComments = tweets[0].commentsCount;

    const comment = await repo.addComment(tweetId, {
      authorId: 'usr_demo_123',
      content: 'نظر تستی',
    });

    expect(comment.id).toBeDefined();
    const comments = await repo.getComments(tweetId);
    expect(comments.some(c => c.id === comment.id)).toBe(true);

    const updatedTweet = await repo.findById(tweetId);
    expect(updatedTweet?.commentsCount).toBe(initialComments + 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/repositories/mock-tweet.repository.test.ts` inside `backend/`
Expected: FAIL

- [ ] **Step 3: Implement domain types, validations, and `MockTweetRepository`**

Create `backend/src/types/tweet.types.ts`:
```typescript
export interface Tweet {
  id: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  views: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  tweetId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface CreateTweetDTO {
  authorId: string;
  content: string;
  mediaUrl?: string;
}

export interface CreateCommentDTO {
  authorId: string;
  content: string;
}

export interface PopulatedTweet extends Omit<Tweet, 'authorId'> {
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  time: string;
  isLiked?: boolean;
}

export interface PopulatedComment extends Omit<Comment, 'authorId'> {
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  time: string;
}
```

Create `backend/src/validations/tweet.validation.ts`:
```typescript
import { z } from 'zod';

export const createTweetSchema = z.object({
  content: z
    .string({ required_error: 'متن پست الزامی است' })
    .min(1, { message: 'متن پست نمی‌تواند خالی باشد' })
    .max(280, { message: 'متن پست نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد' }),
  mediaUrl: z.string().url({ message: 'آدرس رسانه نامعتبر است' }).optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'متن پاسخ الزامی است' })
    .min(1, { message: 'متن پاسخ نمی‌تواند خالی باشد' })
    .max(280, { message: 'متن پاسخ نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد' }),
});
```

Create `backend/src/repositories/tweet.repository.interface.ts`:
```typescript
import { Tweet, Comment, CreateTweetDTO, CreateCommentDTO } from '../types/tweet.types.js';

export interface ITweetRepository {
  findAll(): Promise<Tweet[]>;
  findById(id: string): Promise<Tweet | null>;
  create(data: CreateTweetDTO): Promise<Tweet>;
  toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; count: number }>;
  isLiked(tweetId: string, userId: string): Promise<boolean>;
  getComments(tweetId: string): Promise<Comment[]>;
  addComment(tweetId: string, data: CreateCommentDTO): Promise<Comment>;
}
```

Create `backend/src/repositories/mock-tweet.repository.ts`:
```typescript
import { Tweet, Comment, CreateTweetDTO, CreateCommentDTO } from '../types/tweet.types.js';
import { ITweetRepository } from './tweet.repository.interface.js';

export class MockTweetRepository implements ITweetRepository {
  private tweets: Tweet[] = [];
  private comments: Comment[] = [];
  private likes: Map<string, Set<string>> = new Map(); // tweetId -> Set of userIds

  constructor() {
    this.seed();
  }

  private seed() {
    this.tweets = [
      {
        id: 'tweet_1',
        authorId: 'usr_demo_123',
        content: 'نسخه ۱۶ نکست‌جی‌اس با کامپایل توربوپک فوق‌سریع، پشتیبانی رسمی از ری‌اکت ۱۹ و ارتقای چشمگیر سرور اکشن‌ها منتشر شد! 🚀\n\nبرای شروع دستور npx create-next-app@latest را اجرا کنید.',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        likesCount: 5890,
        commentsCount: 2,
        repostsCount: 1204,
        views: '۱۴۲K',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tweet_2',
        authorId: 'usr_demo_123',
        content: 'ترکیب متریال یو‌آی نسخه ۶ با اپ‌روتر نکست‌جی‌اس و پشتیبانی کامل از حالت تاریک OLED و چیدمان راست‌چین (RTL)، تجربه‌ای کاملاً بومی و روان را برای کاربران فارسی‌زبان فراهم می‌کند.\n\n#ری‌اکت #توسعه_وب #طراحی_رابط_کاربری',
        likesCount: 1430,
        commentsCount: 1,
        repostsCount: 215,
        views: '۴۵.۸K',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tweet_3',
        authorId: 'usr_demo_123',
        content: 'طراحی ۳ ستونه مدرن با تراکم مناسب اطلاعات، مرزبندی‌های ظریف و انیمیشن‌های روان فیزیکی، همواره استاندارد طلایی داشبوردهای تعاملی و شبکه‌های اجتماعی است.',
        mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        likesCount: 890,
        commentsCount: 0,
        repostsCount: 132,
        views: '۲۸.۱K',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ];

    this.comments = [
      {
        id: 'cmt_1',
        tweetId: 'tweet_1',
        authorId: 'usr_demo_123',
        content: 'سرعت کامپایل توربوپک واقعاً شگفت‌انگیزه!',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tweet_1',
        tweetId: 'tweet_1',
        authorId: 'usr_demo_123',
        content: 'آیا با ری‌اکت ۱۹ به صورت کامل سازگاره؟',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmt_3',
        tweetId: 'tweet_2',
        authorId: 'usr_demo_123',
        content: 'راست‌چین کردن متریال یو‌آی با فونت وزیرمتن فوق‌العاده شده.',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ];
  }

  async findAll(): Promise<Tweet[]> {
    return [...this.tweets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id: string): Promise<Tweet | null> {
    const tweet = this.tweets.find((t) => t.id === id);
    return tweet ? { ...tweet } : null;
  }

  async create(data: CreateTweetDTO): Promise<Tweet> {
    const newTweet: Tweet = {
      id: `tweet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: data.authorId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      views: '۱',
      createdAt: new Date().toISOString(),
    };
    this.tweets.unshift(newTweet);
    return { ...newTweet };
  }

  async toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    if (!this.likes.has(tweetId)) {
      this.likes.set(tweetId, new Set());
    }
    const tweetLikes = this.likes.get(tweetId)!;
    const tweet = this.tweets.find((t) => t.id === tweetId);

    let liked = false;
    if (tweetLikes.has(userId)) {
      tweetLikes.delete(userId);
      liked = false;
      if (tweet && tweet.likesCount > 0) tweet.likesCount -= 1;
    } else {
      tweetLikes.add(userId);
      liked = true;
      if (tweet) tweet.likesCount += 1;
    }

    return { liked, count: tweet ? tweet.likesCount : tweetLikes.size };
  }

  async isLiked(tweetId: string, userId: string): Promise<boolean> {
    const tweetLikes = this.likes.get(tweetId);
    return tweetLikes ? tweetLikes.has(userId) : false;
  }

  async getComments(tweetId: string): Promise<Comment[]> {
    return this.comments
      .filter((c) => c.tweetId === tweetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addComment(tweetId: string, data: CreateCommentDTO): Promise<Comment> {
    const newComment: Comment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tweetId,
      authorId: data.authorId,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
    this.comments.push(newComment);

    const tweet = this.tweets.find((t) => t.id === tweetId);
    if (tweet) {
      tweet.commentsCount += 1;
    }

    return { ...newComment };
  }
}

export const tweetRepository = new MockTweetRepository();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/repositories/mock-tweet.repository.test.ts` inside `backend/`
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add backend/src/types/tweet.types.ts backend/src/validations/tweet.validation.ts backend/src/repositories/
git commit -m "feat(backend): add tweet types, validations, and MockTweetRepository"
```

---

### Task 3: Backend Tweet Service, Controller & Routes

**Files:**
- Create: `backend/src/services/tweet.service.ts`
- Create: `backend/src/controllers/tweet.controller.ts`
- Create: `backend/src/routes/tweet.routes.ts`
- Modify: `backend/src/routes/index.ts`
- Test: `backend/src/services/tweet.service.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/tweets`
  - `POST /api/tweets`
  - `POST /api/tweets/:id/like`
  - `GET /api/tweets/:id/comments`
  - `POST /api/tweets/:id/comments`

- [ ] **Step 1: Write test for `TweetService`**

```typescript
// backend/src/services/tweet.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TweetService } from './tweet.service.js';
import { MockTweetRepository } from '../repositories/mock-tweet.repository.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';
import { HandleError } from '../errors/handle-error.js';

describe('TweetService', () => {
  let tweetRepo: MockTweetRepository;
  let userRepo: MockUserRepository;
  let service: TweetService;

  beforeEach(() => {
    tweetRepo = new MockTweetRepository();
    userRepo = new MockUserRepository();
    service = new TweetService(tweetRepo, userRepo);
  });

  it('should return populated feed', async () => {
    const feed = await service.getFeed();
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0].author.name).toBeDefined();
    expect(feed[0].time).toBeDefined();
  });

  it('should create tweet and return populated data', async () => {
    const tweet = await service.createTweet('usr_demo_123', {
      content: 'متن جدید برای تست',
    });
    expect(tweet.content).toBe('متن جدید برای تست');
    expect(tweet.author.handle).toBe('@demo');
  });

  it('should throw HandleError if liking non-existent tweet', async () => {
    await expect(service.toggleLike('non_existent', 'usr_demo_123')).rejects.toThrow(
      HandleError
    );
  });

  it('should toggle like successfully', async () => {
    const feed = await service.getFeed();
    const result = await service.toggleLike(feed[0].id, 'usr_demo_123');
    expect(result.liked).toBe(true);
  });

  it('should add comment and return populated data', async () => {
    const feed = await service.getFeed();
    const comment = await service.addComment(feed[0].id, 'usr_demo_123', {
      content: 'پاسخ تستی',
    });
    expect(comment.content).toBe('پاسخ تستی');
    expect(comment.author.name).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/tweet.service.test.ts` inside `backend/`
Expected: FAIL

- [ ] **Step 3: Implement `TweetService`**

Create `backend/src/services/tweet.service.ts`:
```typescript
import { ITweetRepository } from '../repositories/tweet.repository.interface.js';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { PopulatedTweet, PopulatedComment } from '../types/tweet.types.js';
import { HandleError } from '../errors/handle-error.js';

export class TweetService {
  constructor(
    private tweetRepo: ITweetRepository,
    private userRepo: IUserRepository
  ) {}

  private formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const diff = Math.max(0, now - new Date(dateStr).getTime());
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'همین الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    return `${days} روز پیش`;
  }

  async getFeed(currentUserId?: string): Promise<PopulatedTweet[]> {
    const tweets = await this.tweetRepo.findAll();
    const users = await this.userRepo.getAll();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const populated: PopulatedTweet[] = [];
    for (const t of tweets) {
      const author = userMap.get(t.authorId);
      const isLiked = currentUserId ? await this.tweetRepo.isLiked(t.id, currentUserId) : false;

      populated.push({
        id: t.id,
        content: t.content,
        mediaUrl: t.mediaUrl,
        likesCount: t.likesCount,
        commentsCount: t.commentsCount,
        repostsCount: t.repostsCount,
        views: t.views,
        createdAt: t.createdAt,
        time: this.formatRelativeTime(t.createdAt),
        isLiked,
        author: {
          name: author ? author.name : 'کاربر توییتر',
          handle: author ? `@${author.username}` : '@user',
          avatar: author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          verified: true,
        },
      });
    }

    return populated;
  }

  async createTweet(authorId: string, data: { content: string; mediaUrl?: string }): Promise<PopulatedTweet> {
    const user = await this.userRepo.findById(authorId);
    if (!user) {
      throw HandleError.unauthorized('کاربر معتبر نیست');
    }

    const tweet = await this.tweetRepo.create({
      authorId,
      content: data.content,
      mediaUrl: data.mediaUrl,
    });

    return {
      id: tweet.id,
      content: tweet.content,
      mediaUrl: tweet.mediaUrl,
      likesCount: tweet.likesCount,
      commentsCount: tweet.commentsCount,
      repostsCount: tweet.repostsCount,
      views: tweet.views,
      createdAt: tweet.createdAt,
      time: 'همین الان',
      isLiked: false,
      author: {
        name: user.name,
        handle: `@${user.username}`,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        verified: true,
      },
    };
  }

  async toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const tweet = await this.tweetRepo.findById(tweetId);
    if (!tweet) {
      throw HandleError.notFound('پست مورد نظر یافت نشد');
    }

    const result = await this.tweetRepo.toggleLike(tweetId, userId);
    return { liked: result.liked, likesCount: result.count };
  }

  async getComments(tweetId: string): Promise<PopulatedComment[]> {
    const tweet = await this.tweetRepo.findById(tweetId);
    if (!tweet) {
      throw HandleError.notFound('پست مورد نظر یافت نشد');
    }

    const comments = await this.tweetRepo.getComments(tweetId);
    const users = await this.userRepo.getAll();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return comments.map((c) => {
      const author = userMap.get(c.authorId);
      return {
        id: c.id,
        tweetId: c.tweetId,
        content: c.content,
        createdAt: c.createdAt,
        time: this.formatRelativeTime(c.createdAt),
        author: {
          name: author ? author.name : 'کاربر توییتر',
          handle: author ? `@${author.username}` : '@user',
          avatar: author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          verified: true,
        },
      };
    });
  }

  async addComment(tweetId: string, authorId: string, data: { content: string }): Promise<PopulatedComment> {
    const tweet = await this.tweetRepo.findById(tweetId);
    if (!tweet) {
      throw HandleError.notFound('پست مورد نظر یافت نشد');
    }

    const user = await this.userRepo.findById(authorId);
    if (!user) {
      throw HandleError.unauthorized('کاربر معتبر نیست');
    }

    const comment = await this.tweetRepo.addComment(tweetId, {
      authorId,
      content: data.content,
    });

    return {
      id: comment.id,
      tweetId: comment.tweetId,
      content: comment.content,
      createdAt: comment.createdAt,
      time: 'همین الان',
      author: {
        name: user.name,
        handle: `@${user.username}`,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        verified: true,
      },
    };
  }
}
```

- [ ] **Step 4: Implement `TweetController` and `TweetRoutes`**

Create `backend/src/controllers/tweet.controller.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { TweetService } from '../services/tweet.service.js';
import { tweetRepository } from '../repositories/mock-tweet.repository.js';
import { userRepository } from '../repositories/mock-user.repository.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const tweetService = new TweetService(tweetRepository, userRepository);

export class TweetController {
  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tweets = await tweetService.getFeed(userId);
      res.status(200).json({ success: true, data: { tweets } });
    } catch (error) {
      next(error);
    }
  }

  async createTweet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tweet = await tweetService.createTweet(userId, req.body);
      res.status(201).json({ success: true, message: 'پست با موفقیت ایجاد شد', data: { tweet } });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tweetId = req.params.id;
      const result = await tweetService.toggleLike(tweetId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const tweetId = req.params.id;
      const comments = await tweetService.getComments(tweetId);
      res.status(200).json({ success: true, data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tweetId = req.params.id;
      const comment = await tweetService.addComment(tweetId, userId, req.body);
      res.status(201).json({ success: true, message: 'پاسخ با موفقیت ثبت شد', data: { comment } });
    } catch (error) {
      next(error);
    }
  }
}

export const tweetController = new TweetController();
```

Create `backend/src/routes/tweet.routes.ts`:
```typescript
import { Router } from 'express';
import { tweetController } from '../controllers/tweet.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTweetSchema, createCommentSchema } from '../validations/tweet.validation.js';

const router = Router();

router.get('/', (req, res, next) => tweetController.getFeed(req, res, next));
router.post('/', authenticate, validate(createTweetSchema), (req, res, next) => tweetController.createTweet(req, res, next));
router.post('/:id/like', authenticate, (req, res, next) => tweetController.toggleLike(req, res, next));
router.get('/:id/comments', (req, res, next) => tweetController.getComments(req, res, next));
router.post('/:id/comments', authenticate, validate(createCommentSchema), (req, res, next) => tweetController.addComment(req, res, next));

export default router;
```

Update `backend/src/routes/index.ts` to mount `router.use('/tweets', tweetRoutes);`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run` inside `backend/`
Expected: All tests pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add backend/src/services/ backend/src/controllers/ backend/src/routes/
git commit -m "feat(backend): implement tweet service, controller and routes with HandleError"
```

---

### Task 4: Frontend API Types & Services Layer (`tweet.service.ts`)

**Files:**
- Modify: `src/types/api.ts`
- Create: `src/services/tweet.service.ts`

**Interfaces:**
- Produces: `tweetService` object with typed methods (`getFeed`, `createTweet`, `toggleLike`, `getComments`, `addComment`)

- [ ] **Step 1: Update `src/types/api.ts`**

Include:
```typescript
export interface Author {
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
}

export interface TweetData {
  id: string;
  author: Author;
  time: string;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount?: number;
  views?: string;
  isLiked?: boolean;
}

export interface CommentData {
  id: string;
  tweetId: string;
  author: Author;
  content: string;
  time: string;
  createdAt: string;
}
```

- [ ] **Step 2: Create `src/services/tweet.service.ts`**

```typescript
import api from '@/lib/api';
import { ApiResponse, TweetData, CommentData } from '@/types/api';

export const tweetService = {
  async getFeed(): Promise<TweetData[]> {
    const res = await api.get<ApiResponse<{ tweets: TweetData[] }>>('/tweets');
    return res.data.data?.tweets || [];
  },

  async createTweet(content: string, mediaUrl?: string): Promise<TweetData> {
    const res = await api.post<ApiResponse<{ tweet: TweetData }>>('/tweets', { content, mediaUrl });
    return res.data.data!.tweet;
  },

  async toggleLike(tweetId: string): Promise<{ liked: boolean; likesCount: number }> {
    const res = await api.post<ApiResponse<{ liked: boolean; likesCount: number }>>(`/tweets/${tweetId}/like`);
    return res.data.data!;
  },

  async getComments(tweetId: string): Promise<CommentData[]> {
    const res = await api.get<ApiResponse<{ comments: CommentData[] }>>(`/tweets/${tweetId}/comments`);
    return res.data.data?.comments || [];
  },

  async addComment(tweetId: string, content: string): Promise<CommentData> {
    const res = await api.post<ApiResponse<{ comment: CommentData }>>(`/tweets/${tweetId}/comments`, { content });
    return res.data.data!.comment;
  },
};

export default tweetService;
```

- [ ] **Step 3: Commit Task 4**

```bash
git add src/types/api.ts src/services/tweet.service.ts
git commit -m "feat(frontend): create tweet.service.ts and update api domain types"
```

---

### Task 5: Frontend Interactive Components with Optimistic Updates & Rollback

**Files:**
- Create: `src/components/tweet/CommentsDialog.tsx`
- Modify: `src/components/tweet/TweetCard.tsx`
- Modify: `src/components/tweet/TweetComposer.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `tweetService`, `useAuth`
- Produces: Interactive Persian liking, commenting, and posting with optimistic updates and error notifications.

- [ ] **Step 1: Create `src/components/tweet/CommentsDialog.tsx`**

A responsive Persian Material-UI Dialog showing:
- Original tweet snippet
- Existing comments fetched via `tweetService.getComments(tweet.id)`
- Reply input box with Persian placeholder and submission
- Optimistic addition of new comment with rollback if server call fails
- Inline Persian error alert if submission fails

- [ ] **Step 2: Update `src/components/tweet/TweetCard.tsx`**

- Connect like button to `tweetService.toggleLike(tweet.id)` with optimistic update & rollback.
- Trigger `onError` callback if like fails.
- Connect comment button to open `CommentsDialog`.

- [ ] **Step 3: Update `src/components/tweet/TweetComposer.tsx`**

- Accepts `onPost: (content: string) => Promise<void>`.
- Disables submit button and shows loading indicator while submitting.
- Restores draft content if submission errors.

- [ ] **Step 4: Update `src/app/page.tsx`**

- Fetches live feed using `tweetService.getFeed()` on mount (falls back to initial demo tweets if backend is offline).
- Passes `handlePost` that optimistically adds tweet to feed, calls `tweetService.createTweet`, and rolls back on failure with a Persian `Snackbar` alert.
- Persian `Snackbar` notifying: *«خطا در ثبت تغییرات؛ ارتباط با سرور برقرار نشد.»*

- [ ] **Step 5: Run `npm run build`**

Expected: Build succeeds with 0 errors.

- [ ] **Step 6: Commit Task 5**

```bash
git add src/components/tweet/ src/app/page.tsx
git commit -m "feat(frontend): implement optimistic liking, comments dialog, and resilient feed"
```

---

### Task 6: Comprehensive Verification & Test Suite Execution

**Files:**
- Modify: `backend/src/e2e.test.ts`

- [ ] **Step 1: Add tweet API tests to `backend/src/e2e.test.ts`**
- [ ] **Step 2: Run all backend tests: `npm run backend:test`**
- [ ] **Step 3: Run Next.js production build: `npm run build`**
- [ ] **Step 4: Commit and finalize**
