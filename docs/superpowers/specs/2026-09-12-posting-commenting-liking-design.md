# Design Document: Posting, Commenting & Liking System with Layered Architecture & Error Handling

**Date:** 2026-09-12  
**Status:** Approved  
**Topic:** Posting, Commenting, and Liking Features with Custom HandleError and Resilient Frontend Services

---

## 1. Overview & Goals

This subsystem expands the Twitter/X application by implementing:
1. **Posting, Commenting, and Liking** capabilities across both the isolated Express backend and the Next.js client.
2. A dedicated custom error class **`HandleError`** in the backend for operational and HTTP error formatting.
3. Layered architecture in the backend: `HandleError` ➔ `MockTweetRepository` ➔ `TweetService` ➔ `TweetController` ➔ `TweetRoutes` ➔ Zod validations.
4. A frontend **services layer** (`src/services/tweet.service.ts`) using the configured Axios client with interceptors.
5. **Resilient Optimistic State Management**:
   - Immediate UI feedback for liking, posting, and commenting.
   - Clean rollback to previous state and Persian error notifications if the backend is down, unreachable, or returns an error.
6. A responsive Persian RTL **Comments Dialog modal** with full reply history and submission composer.

---

## 2. Backend Architecture (`/backend`)

### 2.1 File Map
```
backend/
└── src/
    ├── errors/
    │   └── handle-error.ts             # Custom HandleError class
    ├── types/
    │   └── tweet.types.ts              # Tweet, Comment, and Like domain interfaces
    ├── validations/
    │   └── tweet.validation.ts         # Zod schemas for createTweet and createComment
    ├── repositories/
    │   ├── tweet.repository.interface.ts
    │   └── mock-tweet.repository.ts    # In-memory storage for tweets, comments, and likes
    ├── services/
    │   └── tweet.service.ts            # Business logic for feed, posting, liking, commenting
    ├── controllers/
    │   └── tweet.controller.ts         # Request/response handlers
    └── routes/
        └── tweet.routes.ts             # /api/tweets endpoints
```

### 2.2 Custom Error Handling (`backend/src/errors/handle-error.ts`)
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
In `backend/src/middlewares/error.middleware.ts`, errors of type `HandleError` are handled with their designated status codes and Persian messages:
```typescript
if (err instanceof HandleError) {
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors,
  });
}
```

### 2.3 Repository & Data Model (`ITweetRepository`)
* `findAll(): Promise<Tweet[]>`
* `findById(id: string): Promise<Tweet | null>`
* `create(data: CreateTweetDTO): Promise<Tweet>`
* `toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; count: number }>`
* `isLiked(tweetId: string, userId: string): Promise<boolean>`
* `getComments(tweetId: string): Promise<Comment[]>`
* `addComment(tweetId: string, data: CreateCommentDTO): Promise<Comment>`

Seed Data: Seeded with the 3 Persian tweets on the homepage plus sample comments.

### 2.4 Service Layer (`TweetService`)
* Connects `IUserRepository` and `ITweetRepository`.
* Populates author details (`name`, `username`, `avatar`, `verified`) for each tweet and comment.
* Verifies tweet existence and user authorization; throws `HandleError.notFound()` or `HandleError.unauthorized()` as required.

### 2.5 API Endpoints
* `GET /api/tweets`: Returns feed of tweets (with `isLiked` state if user provides Bearer token).
* `POST /api/tweets`: Creates a new tweet (requires JWT, validates `content` with Zod).
* `POST /api/tweets/:id/like`: Toggles like status (requires JWT, returns `{ liked: boolean, likesCount: number }`).
* `GET /api/tweets/:id/comments`: Returns array of comments for a tweet.
* `POST /api/tweets/:id/comments`: Adds a comment to a tweet (requires JWT, validates `content` with Zod).

---

## 3. Frontend Architecture (Next.js 16 Client)

### 3.1 Services Layer (`src/services/tweet.service.ts`)
Decouples all networking logic into a clean, reusable service:
* `getFeed()`: `GET /tweets`
* `createTweet(content, mediaUrl?)`: `POST /tweets`
* `toggleLike(tweetId)`: `POST /tweets/:id/like`
* `getComments(tweetId)`: `GET /tweets/:id/comments`
* `addComment(tweetId, content)`: `POST /tweets/:id/comments`

### 3.2 Optimistic UI & Resilient Error Handling
All interactive actions update the local UI state first:
1. **Liking**:
   * Saves snapshot of `liked` and `likeCount`.
   * Updates state optimistically.
   * Dispatches `tweetService.toggleLike(id)`.
   * On failure: Reverts state to snapshot and displays Snackbar notification in Persian.
2. **Posting**:
   * Creates temporary tweet object with current user's profile and adds to top of feed.
   * Dispatches `tweetService.createTweet(content)`.
   * On failure: Removes the temporary tweet, puts the content back into the composer, and triggers error alert.
3. **Commenting**:
   * Creates temporary comment and displays in `CommentsDialog`.
   * Dispatches `tweetService.addComment(tweetId, content)`.
   * On failure: Removes the temporary comment and shows error message in modal.

### 3.3 Persian UI Components
* **`CommentsDialog.tsx`**:
  * Dialog modal styled with dark/light theme tokens and RTL layout.
  * Shows original tweet author & snippet.
  * List of comments with author avatar, Persian timestamp, and comment body.
  * Composer input with Persian placeholder (*«پاسخ خود را بنویسید...»*) and "پاسخ" button.
* **`TweetCard.tsx`**:
  * Integrated with `liked` status, like count, comment count, and `CommentsDialog`.
* **`TweetComposer.tsx`**:
  * Integrated with `tweetService.createTweet` and Persian error handling.

---

## 4. Verification Plan

1. **Backend Verification**:
   * Unit tests for `HandleError` class and `MockTweetRepository`.
   * Unit tests for `TweetService` (create, like toggle, comment addition).
   * E2E tests for `POST /api/tweets`, `POST /api/tweets/:id/like`, `POST /api/tweets/:id/comments`, verifying 200/201 on success and 401/404/400 on failure with `HandleError`.
2. **Frontend Verification**:
   * Test feed loading from `tweetService.getFeed()`.
   * Test posting new tweet through UI.
   * Test liking a tweet (visual toggle, count increase/decrease).
   * Test opening comments modal, viewing comments, and submitting a new comment.
   * Test offline resilience: verify that if backend is stopped or endpoint fails, the UI rolls back cleanly and displays Persian error toast.
