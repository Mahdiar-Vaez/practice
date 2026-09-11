import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import app from './app.js';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://localhost:${address.port}/api`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('E2E Backend API Authentication & Validation', () => {
  it('GET /api/health should return ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });

  it('POST /api/auth/login with valid demo credentials returns 200 and JWT', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@example.com',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('demo@example.com');
    expect(body.data.user.username).toBe('demo');
    expect(body.data.user.name).toBe('کاربر دمو');
  });

  it('POST /api/auth/login with invalid password returns 401 with Persian error', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@example.com',
        password: 'wrong_password_test',
      }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('اطلاعات ورود نامعتبر است');
  });

  it('POST /api/auth/login with invalid body fails Zod validation with 400', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'a', // too short (<3)
        password: '123', // too short (<6)
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors).toBeDefined();
    expect(body.errors.identifier).toContain('ایمیل یا نام کاربری باید حداقل ۳ کاراکتر باشد');
    expect(body.errors.password).toContain('رمز عبور باید حداقل ۶ کاراکتر باشد');
  });

  it('POST /api/auth/register creates a new user and returns 201', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'علی احمدی',
        username: 'ali_ahmadi',
        email: 'ali@example.com',
        password: 'securePassword123',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.username).toBe('ali_ahmadi');
  });

  it('GET /api/auth/me returns 401 without Bearer token', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns user profile with valid Bearer token', async () => {
    // 1. Log in first
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@example.com',
        password: 'password123',
      }),
    });
    const { data } = await loginRes.json();
    const token = data.token;

    // 2. Access /me
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.success).toBe(true);
    expect(meBody.data.user.email).toBe('demo@example.com');
  });
});

describe('E2E Backend Tweet, Comment & Like APIs', () => {
  let token: string;

  beforeAll(async () => {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@example.com',
        password: 'password123',
      }),
    });
    const body = await loginRes.json();
    token = body.data.token;
  });

  it('GET /api/tweets returns 200 with list of seeded tweets', async () => {
    const res = await fetch(`${baseUrl}/tweets`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.tweets)).toBe(true);
    expect(body.data.tweets.length).toBeGreaterThanOrEqual(3);
    expect(body.data.tweets[0].author.name).toBeDefined();
  });

  it('POST /api/tweets without token returns 401', async () => {
    const res = await fetch(`${baseUrl}/tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'تست بدون لاگین' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/tweets with empty content returns 400 with Persian validation error', async () => {
    const res = await fetch(`${baseUrl}/tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: '' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors?.content).toContain('متن پست نمی‌تواند خالی باشد');
  });

  it('POST /api/tweets with valid content returns 201 and created tweet', async () => {
    const res = await fetch(`${baseUrl}/tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: 'توییت تست خودکار E2E' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.tweet.content).toBe('توییت تست خودکار E2E');
    expect(body.data.tweet.author.handle).toBe('@demo');
  });

  it('POST /api/tweets/:id/like toggles like on tweet', async () => {
    // 1. Get first tweet
    const feedRes = await fetch(`${baseUrl}/tweets`);
    const feedBody = await feedRes.json();
    const tweetId = feedBody.data.tweets[0].id;
    const initialLikes = feedBody.data.tweets[0].likesCount;

    // 2. Like it
    const likeRes = await fetch(`${baseUrl}/tweets/${tweetId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(likeRes.status).toBe(200);
    const likeBody = await likeRes.json();
    expect(likeBody.success).toBe(true);
    expect(likeBody.data.liked).toBe(true);
    expect(likeBody.data.likesCount).toBe(initialLikes + 1);

    // 3. Unlike it
    const unlikeRes = await fetch(`${baseUrl}/tweets/${tweetId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(unlikeRes.status).toBe(200);
    const unlikeBody = await unlikeRes.json();
    expect(unlikeBody.data.liked).toBe(false);
    expect(unlikeBody.data.likesCount).toBe(initialLikes);
  });

  it('POST /api/tweets/:id/like on invalid ID returns 404 via HandleError', async () => {
    const res = await fetch(`${baseUrl}/tweets/invalid_id_999/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('پست مورد نظر یافت نشد');
  });

  it('GET /api/tweets/:id/comments returns comments list', async () => {
    const feedRes = await fetch(`${baseUrl}/tweets`);
    const feedBody = await feedRes.json();
    const tweetId = feedBody.data.tweets[0].id;

    const res = await fetch(`${baseUrl}/tweets/${tweetId}/comments`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.comments)).toBe(true);
  });

  it('POST /api/tweets/:id/comments creates a new comment', async () => {
    const feedRes = await fetch(`${baseUrl}/tweets`);
    const feedBody = await feedRes.json();
    const tweetId = feedBody.data.tweets[0].id;

    const res = await fetch(`${baseUrl}/tweets/${tweetId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: 'نظر جدید برای تست E2E' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.comment.content).toBe('نظر جدید برای تست E2E');
    expect(body.data.comment.author.name).toBe('کاربر دمو');
  });
});

