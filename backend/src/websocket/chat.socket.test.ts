import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { setupChatWebSocket } from './chat.socket.js';
import { env } from '../config/env.js';

describe('ChatWebSocket Engine', () => {
  let server: http.Server;
  let port: number;
  let demoToken: string;
  let saraToken: string;

  beforeAll(async () => {
    server = http.createServer();
    setupChatWebSocket(server);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as any;
        port = address.port;
        resolve();
      });
    });

    demoToken = jwt.sign(
      { userId: 'usr_demo_123', email: 'demo@example.com', username: 'demo' },
      env.JWT_SECRET
    );

    saraToken = jwt.sign(
      { userId: 'usr_sara_456', email: 'sara@example.com', username: 'sara' },
      env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should reject connection without token', async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws/chat`);

    const closePromise = new Promise<{ code: number; reason: string }>((resolve) => {
      ws.on('close', (code, reason) => {
        resolve({ code, reason: reason.toString() });
      });
    });

    const res = await closePromise;
    expect(res.code).toBe(1008);
  });

  it('should accept connection with valid token and respond to ping', async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws/chat?token=${demoToken}`);

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => resolve());
      ws.on('error', reject);
    });

    const pongPromise = new Promise<any>((resolve) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'pong') resolve(msg);
      });
    });

    ws.send(JSON.stringify({ type: 'ping' }));
    const pong = await pongPromise;
    expect(pong.type).toBe('pong');

    ws.close();
  });

  it('should broadcast chat:message to both sender and receiver', async () => {
    const senderWs = new WebSocket(`ws://localhost:${port}/ws/chat?token=${demoToken}`);
    const receiverWs = new WebSocket(`ws://localhost:${port}/ws/chat?token=${saraToken}`);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        senderWs.on('open', () => resolve());
        senderWs.on('error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        receiverWs.on('open', () => resolve());
        receiverWs.on('error', reject);
      }),
    ]);

    const messageContent = 'سلام سارا، تست پیام زنده وب‌سوکت';

    const senderReceivedPromise = new Promise<any>((resolve) => {
      senderWs.on('message', (raw) => {
        const data = JSON.parse(raw.toString());
        if (data.type === 'chat:message') resolve(data);
      });
    });

    const receiverReceivedPromise = new Promise<any>((resolve) => {
      receiverWs.on('message', (raw) => {
        const data = JSON.parse(raw.toString());
        if (data.type === 'chat:message') resolve(data);
      });
    });

    senderWs.send(
      JSON.stringify({
        type: 'chat:send',
        toUserId: 'usr_sara_456',
        content: messageContent,
      })
    );

    const [senderResult, receiverResult] = await Promise.all([
      senderReceivedPromise,
      receiverReceivedPromise,
    ]);

    expect(senderResult.message.content).toBe(messageContent);
    expect(senderResult.message.senderId).toBe('usr_demo_123');
    expect(senderResult.message.receiverId).toBe('usr_sara_456');

    expect(receiverResult.message.content).toBe(messageContent);
    expect(receiverResult.message.id).toBe(senderResult.message.id);

    senderWs.close();
    receiverWs.close();
  });
});
