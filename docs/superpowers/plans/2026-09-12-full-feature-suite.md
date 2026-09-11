# Implementation Plan: Comprehensive Feature Suite

**Date:** 2026-09-12  
**Spec:** `docs/superpowers/specs/2026-09-12-full-feature-suite-design.md`  
**Goal:** Implement Registration, Auth Guard, Profile Management, Account Deletion, Media/Document Uploads, Hashtags, Search/Filters, and WebSocket Real-Time Chat.

---

## Global Constraints & Standards
1. **Full Persian Localization**: All user-facing strings in Persian with Vazirmatn font and RTL alignment.
2. **Layered Backend Architecture**: Repository ➔ Service ➔ Controller ➔ Routes ➔ Middleware ➔ Validations.
3. **HandleError**: Use `HandleError` class for all operational errors with status codes and Persian messages.
4. **Optimistic UI with Rollback**: All state modifications in frontend update optimistically and roll back upon error.
5. **No Broken Builds**: Zero TypeScript errors; all backend Vitest tests and Next.js builds must pass.

---

### Task 1: Domain 1 - Auth Guard, Registration, Profile Editing, Account Deletion & User Activity Tabs

**Files:**
- Modify: `backend/src/types/user.types.ts`
- Modify: `backend/src/repositories/user.repository.interface.ts`
- Modify: `backend/src/repositories/mock-user.repository.ts`
- Modify: `backend/src/services/user.service.ts` (or create if needed)
- Modify: `backend/src/controllers/user.controller.ts` (or create if needed)
- Modify: `backend/src/routes/user.routes.ts`
- Modify: `backend/src/routes/index.ts`
- Modify: `src/types/api.ts`
- Create: `src/components/auth/AuthGuard.tsx`
- Modify: `src/components/layout/AppLayout.tsx`
- Modify: `src/app/login/page.tsx`
- Create: `src/components/profile/EditProfileDialog.tsx`
- Create: `src/components/profile/DeleteAccountDialog.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/services/auth.service.ts`

**Steps:**
1. Add `updateProfile`, `deleteAccount`, `getUserTweets`, `getUserLikes`, and `getUserComments` to user repository and service.
2. Expose `PUT /api/users/profile`, `DELETE /api/users/account`, `GET /api/users/:id/likes`, `GET /api/users/:id/comments`, `GET /api/users/:id/tweets`.
3. Create `AuthGuard.tsx` in frontend to protect all app routes and redirect guests to `/login`.
4. Add full Registration tab / form in `src/app/login/page.tsx` with Persian validation and auto-login.
5. Update `src/app/profile/page.tsx` with Edit Profile modal, Delete Account modal, and real tabs for Tweets, Replies, and Likes.
6. Run tests and commit.

---

### Task 2: Domain 2 - Media & Document Upload System

**Files:**
- Create: `backend/src/routes/upload.routes.ts`
- Create: `backend/src/controllers/upload.controller.ts`
- Create: `backend/src/services/upload.service.ts`
- Modify: `backend/src/routes/index.ts`
- Modify: `backend/src/app.ts` (serve static uploads directory)
- Create: `src/services/upload.service.ts`
- Modify: `src/components/tweet/TweetComposer.tsx`

**Steps:**
1. Configure `multer` storage for `backend/public/uploads` supporting images (jpg, png, webp, gif) and documents (pdf, docx, txt) with size limits.
2. Mount static middleware in `backend/src/app.ts` to serve `/uploads`.
3. Create frontend `src/services/upload.service.ts` to upload files via FormData.
4. Add image and document attachment picker in `TweetComposer.tsx` with preview and remove button.
5. Run tests and commit.

---

### Task 3: Domain 3 - Hashtags, Search & Feed Filtering

**Files:**
- Create: `backend/src/services/search.service.ts`
- Create: `backend/src/controllers/search.controller.ts`
- Create: `backend/src/routes/search.routes.ts`
- Modify: `backend/src/routes/tweet.routes.ts`
- Modify: `backend/src/services/tweet.service.ts`
- Modify: `backend/src/routes/index.ts`
- Create: `src/services/search.service.ts`
- Modify: `src/components/tweet/TweetCard.tsx` (parse and render clickable hashtags)
- Modify: `src/app/explore/page.tsx` (live search, hashtag discovery, tabs)
- Modify: `src/app/page.tsx` (feed filtering: all, media, latest)

**Steps:**
1. Implement `searchTweetsAndUsers` and `getHashtagTweets` in `search.service.ts`.
2. Support `?filter=media|latest` in `tweetService.getFeed()`.
3. Update `TweetCard.tsx` to automatically detect `#هشتگ` and render as links to `/explore?q=%23هشتگ`.
4. Update `src/app/explore/page.tsx` with real search input, debouncing, and search results.
5. Run tests and commit.

---

### Task 4: Domain 4 - WebSocket Real-Time Chat Engine & Messages View

**Files:**
- Create: `backend/src/repositories/chat.repository.interface.ts`
- Create: `backend/src/repositories/mock-chat.repository.ts`
- Create: `backend/src/services/chat.service.ts`
- Create: `backend/src/controllers/chat.controller.ts`
- Create: `backend/src/routes/chat.routes.ts`
- Create: `backend/src/websocket/chat.socket.ts`
- Modify: `backend/src/server.ts`
- Modify: `src/types/api.ts`
- Create: `src/services/chat.service.ts`
- Create: `src/hooks/useChat.ts`
- Modify: `src/app/messages/page.tsx`

**Steps:**
1. Create `MockChatRepository` storing direct messages between users.
2. Initialize `WebSocketServer` in `backend/src/websocket/chat.socket.ts` attached to Express HTTP server.
3. Authenticate WebSocket connections via JWT token; handle message sending and broadcast to recipient.
4. Expose REST endpoints for conversation list and message history: `GET /api/chats`, `GET /api/chats/:userId/messages`.
5. Implement `useChat` hook in frontend managing WebSocket lifecycle and message state.
6. Build interactive two-column chat in `src/app/messages/page.tsx` with real-time updates and attachment support.
7. Run tests and commit.

---

### Task 5: Comprehensive Integration, Testing & Final Verification

**Files:**
- Modify: `backend/src/e2e.test.ts`
- Run: `npm run backend:test`
- Run: `npm run build`

**Steps:**
1. Add E2E tests for registration, profile editing, account deletion, uploads, search, and chat.
2. Verify all Vitest tests pass cleanly.
3. Verify Next.js production build succeeds with 0 errors.
4. Final review and polish.
