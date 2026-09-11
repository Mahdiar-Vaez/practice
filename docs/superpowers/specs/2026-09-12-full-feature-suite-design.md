# Design Document: Twitter/X Comprehensive Feature Suite

**Date:** 2026-09-12  
**Status:** Approved  
**Topic:** Sign Up, Auth Guard, Profile Management & Deletion, Media & Document Uploads, Hashtags, Search & Filters, and WebSocket Real-Time Chat

---

## 1. Executive Summary & Goals

This specification formalizes the implementation of the remaining production features for the Twitter/X platform across backend and frontend, adhering to Clean Layered Architecture, Persian (RTL) design standards, robust offline error handling with `HandleError`, and WebSocket real-time messaging:

1. **Sign Up & Auth Guard**:
   - Complete registration flow with Persian validation and auto-login.
   - Client-side and route-level Auth Guard redirecting unauthenticated users to `/login`.
   - Complete removal of hardcoded demo user assumptions and graceful session restoration.
2. **Profile Lifecycle & Activity**:
   - Edit Profile (name, bio, avatar upload/URL).
   - Delete Account (permanent removal with confirmation and session purge).
   - Activity tabs on `/profile`: User's Tweets, Replies/Comments, and Liked Posts.
3. **Media & Document Upload System**:
   - Support uploading images (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and documents (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
   - Static file delivery endpoint `/uploads` and attachment picker in `TweetComposer`.
4. **Hashtags, Search & Filters**:
   - Hashtag parsing (`#هشتگ`) in posts, index mapping, and clickable hashtag links.
   - Search API across tweets and users (`/api/search?q=...`) integrated into `/explore`.
   - Feed filtering by media-only, top posts, and latest chronological order.
5. **Real-Time WebSocket Chat**:
   - WebSocket server attached to HTTP server (`ws` library).
   - Authenticated JWT handshake on connection.
   - 1-on-1 messaging, message history persistence, active conversations, and `/messages` view.

---

## 2. Architecture & Domain Separation

The system is partitioned into 4 distinct domains:

### Domain 1: Auth Guard, Registration & Account Lifecycle
- **Backend**:
  - `POST /api/auth/register`: Zod validation (`name`, `username`, `email`, `password`, `confirmPassword`).
  - `PUT /api/users/profile`: Update name, bio, avatar.
  - `DELETE /api/users/account`: Delete user account and cascade clean likes, comments, and tweets.
  - `GET /api/users/:id/likes`: Fetch tweets liked by user.
  - `GET /api/users/:id/comments`: Fetch replies made by user.
  - `GET /api/users/:id/tweets`: Fetch tweets posted by user.
- **Frontend**:
  - `src/components/auth/RegisterModal.tsx` & `/login` register toggle.
  - `src/components/auth/AuthGuard.tsx`: Checks `isAuthenticated` and `loading`. Redirects guests to `/login` with return url.
  - `src/app/profile/page.tsx`: Full interactive tabs (توییت‌ها, پاسخ‌ها, پسندیده‌ها), Edit Profile modal, and Delete Account modal with confirmation.

### Domain 2: Media & Document Upload System
- **Backend**:
  - `POST /api/upload`: Handles multipart file uploads or base64 data payloads.
  - Validates file size (images ≤ 10MB, documents ≤ 25MB) and MIME types.
  - Serves files from `backend/public/uploads` mounted at `/api/uploads/`.
- **Frontend**:
  - `src/services/upload.service.ts`: Handles file upload requests.
  - `src/components/tweet/TweetComposer.tsx`: Image picker and Document attachment picker with thumbnail and remove button.

### Domain 3: Hashtags, Search & Filtering
- **Backend**:
  - `backend/src/services/search.service.ts` & `backend/src/routes/search.routes.ts`.
  - `GET /api/search?q=...`: Case-insensitive search on tweets and users.
  - `GET /api/hashtags/:tag`: Returns all tweets matching hashtag.
  - `GET /api/tweets?filter=media|latest|top`: Feed filtering.
- **Frontend**:
  - `src/services/search.service.ts`: API methods for search and hashtag querying.
  - `src/app/explore/page.tsx`: Search bar with debounced query, tabs for Tweets, Users, and Hashtags.
  - `src/components/tweet/TweetCard.tsx`: Highlights `#hashtags` as clickable links navigating to `/explore?q=%23hashtag`.

### Domain 4: WebSocket Real-Time Chat Engine
- **Backend**:
  - `backend/src/websocket/chat.socket.ts`: Initializes WebSocket server on Express HTTP instance.
  - Authentication via JWT token in handshake query / authorization message.
  - Message schema: `{ type: 'direct_message', toUserId, content, mediaUrl, documentUrl }`.
  - In-memory chat storage in `MockChatRepository` with conversation threads.
  - REST endpoints for fallback / history: `GET /api/chats`, `GET /api/chats/:userId/messages`.
- **Frontend**:
  - `src/hooks/useChat.ts`: Manages WebSocket connection, reconnection, incoming messages, and typing indicators.
  - `src/app/messages/page.tsx`: Split view with conversation list on right and active chat on left, attachment support for pictures and documents.

---

## 3. Data Models & Interfaces

### 3.1 User & Account
```typescript
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  avatar?: string;
}
```

### 3.2 Uploaded Asset
```typescript
export interface UploadedAsset {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  type: 'image' | 'document';
}
```

### 3.3 Chat & Direct Message
```typescript
export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  documentUrl?: string;
  documentName?: string;
  createdAt: string;
  read: boolean;
}

export interface ConversationSummary {
  participant: User;
  lastMessage: DirectMessage;
  unreadCount: number;
}
```

---

## 4. Error Handling & Edge Cases

1. **Unauthenticated Access**: `AuthGuard` displays a clean loading spinner while checking local storage / `/auth/me`, then redirects to `/login`.
2. **WebSocket Disconnections**: Automatic exponential backoff reconnection on frontend.
3. **Invalid File Uploads**: `HandleError.badRequest` for unsupported MIME types or oversized files with Persian messages.
4. **Deleted Account**: Automatically clears `auth_token` and `auth_user` from `localStorage`, cancels all active WebSocket connections, and redirects to `/login`.
5. **Offline Resiliency**: All operations preserve optimistic updates and rollback on network errors.

---

## 5. Verification Plan

1. **Vitest Unit & E2E Tests (`npm run backend:test`)**:
   - Registration, profile update, account deletion tests.
   - Upload validation tests.
   - Search and hashtag query tests.
   - Chat repository and WebSocket handshake tests.
2. **Frontend Build (`npm run build`)**:
   - Zero TypeScript errors across all routes (`/`, `/login`, `/explore`, `/messages`, `/profile`, `/bookmarks`).
3. **Visual & Interactive Validation**:
   - 100% Persian typography with Vazirmatn and RTL direction.
