import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import searchRoutes from './search.routes.js';
import { env } from '../config/env.js';

describe('Search Routes Integration Tests', () => {
  let app: express.Application;
  let server: http.Server;
  let baseUrl: string;
  let validToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/search', searchRoutes);

    validToken = jwt.sign(
      { userId: 'usr_demo_123', email: 'demo@example.com', username: 'demo' },
      env.JWT_SECRET
    );

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}/api/search`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/search?q=... returns search results for tweets and users', async () => {
    const res = await fetch(`${baseUrl}?q=توربوپک`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.tweets)).toBe(true);
    expect(body.data.tweets.length).toBeGreaterThan(0);
    expect(body.data.tweets[0].content).toContain('توربوپک');
  });

  it('GET /api/search with Authorization header passes user to search', async () => {
    const res = await fetch(`${baseUrl}?q=توربوپک`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.tweets).toBeDefined();
  });

  it('GET /api/search/trending returns trending hashtags sorted by count', async () => {
    const res = await fetch(`${baseUrl}/trending`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.hashtags).toBeDefined();
    expect(Array.isArray(body.data.hashtags)).toBe(true);
    expect(body.data.hashtags.length).toBeGreaterThan(0);
    expect(body.data.hashtags[0].tag).toBeDefined();
    expect(body.data.hashtags[0].count).toBeDefined();
  });

  it('GET /api/search/hashtags/:tag returns tweets matching the hashtag', async () => {
    const tag = encodeURIComponent('ری‌اکت');
    const res = await fetch(`${baseUrl}/hashtags/${tag}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.tweets)).toBe(true);
    expect(body.data.tweets.length).toBeGreaterThan(0);
    expect(body.data.tweets[0].content).toContain('#ری‌اکت');
  });
});
