import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { chatService } from '../services/chat.service.js';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

const activeConnections = new Map<string, Set<WebSocket>>();

export function getActiveConnections(): Map<string, Set<WebSocket>> {
  return activeConnections;
}

export function notifyMessagesRead(readerId: string, authorId: string): void {
  const sockets = activeConnections.get(authorId);
  if (sockets) {
    const payload = JSON.stringify({
      type: 'chat:read',
      readerId,
    });
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}

export function setupChatWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  // Heartbeat ping/pong interval
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      const extWs = client as AuthenticatedWebSocket;
      if (extWs.isAlive === false) {
        extWs.terminate();
        return;
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (socket: AuthenticatedWebSocket, req: http.IncomingMessage) => {
    // 1. Extract JWT token from handshake
    let token: string | null = null;

    if (req.url) {
      try {
        const url = new URL(req.url, 'http://localhost');
        token = url.searchParams.get('token');
      } catch {
        // Ignore URL parse error
      }
    }

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace(/^Bearer\s+/i, '').trim();
    }

    if (!token && req.headers['sec-websocket-protocol']) {
      token = req.headers['sec-websocket-protocol'].split(',')[0].trim();
    }

    if (!token) {
      socket.close(1008, 'توکن احراز هویت ارائه نشده است');
      return;
    }

    // 2. Verify JWT token
    let userId: string;
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId?: string;
        id?: string;
        email?: string;
        username?: string;
      };

      const resolvedId = decoded.userId || decoded.id;
      if (!resolvedId) {
        socket.close(1008, 'توکن فاقد شناسه کاربری معتبر است');
        return;
      }
      userId = resolvedId;
    } catch {
      socket.close(1008, 'توکن احراز هویت منقضی شده یا نامعتبر است');
      return;
    }

    // 3. Mark socket as authenticated & alive
    socket.userId = userId;
    socket.isAlive = true;

    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId)!.add(socket);

    socket.on('pong', () => {
      socket.isAlive = true;
    });

    socket.on('ping', () => {
      socket.isAlive = true;
      socket.pong();
    });

    // 4. Handle incoming messages from client
    socket.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // Heartbeat ping via JSON payload
        if (data.type === 'ping') {
          socket.isAlive = true;
          socket.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'pong') {
          socket.isAlive = true;
          return;
        }

        // Mark read event
        if (data.type === 'chat:read') {
          const targetId = data.toUserId || data.targetUserId || data.targetId;
          if (targetId) {
            await chatService.markRead(userId, targetId);
            notifyMessagesRead(userId, targetId);
          }
          return;
        }

        // Typing indicator event
        if (data.type === 'chat:typing') {
          const toUserId = data.toUserId || data.targetUserId || data.receiverId;
          if (toUserId) {
            const receiverSockets = activeConnections.get(toUserId);
            if (receiverSockets) {
              const payload = JSON.stringify({
                type: 'chat:typing',
                fromUserId: userId,
                isTyping: !!data.isTyping,
              });
              for (const ws of receiverSockets) {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(payload);
                }
              }
            }
          }
          return;
        }

        // Send message event
        if (data.type === 'chat:send') {
          const toUserId = data.toUserId || data.receiverId;
          const { content, mediaUrl, documentUrl, documentName } = data;

          if (!toUserId) {
            socket.send(
              JSON.stringify({
                type: 'chat:error',
                message: 'شناسه کاربر دریافت‌کننده الزامی است',
              })
            );
            return;
          }

          const message = await chatService.sendMessage(userId, {
            receiverId: toUserId,
            content,
            mediaUrl,
            documentUrl,
            documentName,
          });

          const payload = JSON.stringify({
            type: 'chat:message',
            message,
          });

          // Emit to sender's active sockets
          const senderSockets = activeConnections.get(userId);
          if (senderSockets) {
            for (const ws of senderSockets) {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(payload);
              }
            }
          }

          // Emit to receiver's active sockets
          if (toUserId !== userId) {
            const receiverSockets = activeConnections.get(toUserId);
            if (receiverSockets) {
              for (const ws of receiverSockets) {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(payload);
                }
              }
            }
          }
        }
      } catch (err: any) {
        socket.send(
          JSON.stringify({
            type: 'chat:error',
            message: err.message || 'خطا در پردازش پیام چت',
          })
        );
      }
    });

    // 5. Handle cleanup on close
    socket.on('close', () => {
      const userSockets = activeConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          activeConnections.delete(userId);
        }
      }
    });

    socket.on('error', (err) => {
      console.error(`WebSocket error for user ${userId}:`, err);
    });
  });

  return wss;
}
