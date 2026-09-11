import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import uploadRoutes from './upload.routes.js';
import { errorHandler } from '../middlewares/error.middleware.js';
import { env } from '../config/env.js';
import { UPLOAD_DIR } from '../controllers/upload.controller.js';

describe('Upload API Integration', () => {
  let server: http.Server;
  let baseUrl: string;
  let validToken: string;
  const createdFiles: string[] = [];

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/upload', uploadRoutes);
    app.use(errorHandler);

    validToken = jwt.sign(
      { userId: 'user-upload-test', email: 'uploader@example.com', username: 'uploader' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}/api/upload`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

    // Clean up test files created in UPLOAD_DIR
    for (const filename of createdFiles) {
      const filePath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore cleanup error
        }
      }
    }
  });

  it('should return 401 when no token is provided', async () => {
    const formData = new FormData();
    const blob = new Blob(['sample content'], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    const res = await fetch(baseUrl, {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('should return 200 and correct payload when uploading valid PNG image', async () => {
    const formData = new FormData();
    const blob = new Blob(['fake image binary data'], { type: 'image/png' });
    formData.append('file', blob, 'avatar.png');

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('فایل با موفقیت بارگذاری شد');
    expect(body.data).toBeDefined();
    expect(body.data.url).toMatch(/^\/uploads\/.+/);
    expect(body.data.filename).toBeDefined();
    expect(body.data.originalName).toBe('avatar.png');
    expect(body.data.mimetype).toBe('image/png');
    expect(body.data.type).toBe('image');
    expect(body.data.size).toBeGreaterThan(0);

    createdFiles.push(body.data.filename);
  });

  it('should return 200 and type="document" when uploading valid PDF document', async () => {
    const formData = new FormData();
    const blob = new Blob(['%PDF-1.4 sample document content'], { type: 'application/pdf' });
    formData.append('file', blob, 'resume.pdf');

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.type).toBe('document');
    expect(body.data.mimetype).toBe('application/pdf');

    createdFiles.push(body.data.filename);
  });

  it('should return 400 for unsupported MIME type', async () => {
    const formData = new FormData();
    const blob = new Blob(['console.log("malicious");'], { type: 'application/javascript' });
    formData.append('file', blob, 'script.js');

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('پشتیبانی نمی‌شود');
  });

  it('should return 400 when no file is uploaded', async () => {
    const formData = new FormData();

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
