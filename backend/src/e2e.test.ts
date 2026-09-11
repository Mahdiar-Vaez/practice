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
