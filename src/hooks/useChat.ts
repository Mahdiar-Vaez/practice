'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import chatService from '@/services/chat.service';
import {
  DirectMessage,
  ConversationSummary,
  ChatConnectionStatus,
  SendMessagePayload,
} from '@/types/chat';

export interface UseChatOptions {
  initialTargetUserId?: string | null;
}

export function useChat(initialTargetUserId: string | null = null) {
  const { user, token } = useAuth();

  const [activeUserId, setActiveUserIdState] = useState<string | null>(initialTargetUserId);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>('disconnected');
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeUserIdRef = useRef<string | null>(activeUserId);
  const userRef = useRef(user);

  // Keep refs up-to-date for WebSocket event callbacks
  useEffect(() => {
    activeUserIdRef.current = activeUserId;
    setIsPartnerTyping(false);
  }, [activeUserId]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Fetch conversations
  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoadingConversations(true);
      const convos = await chatService.getConversations();
      setConversations(convos);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [token]);

  // 2. Fetch messages for active user
  const loadMessages = useCallback(async (targetId: string) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      const history = await chatService.getMessages(targetId);
      setMessages(history);

      // Decrement/clear unread count locally for this conversation
      setConversations((prev) =>
        prev.map((c) => (c.userId === targetId ? { ...c, unreadCount: 0 } : c))
      );

      // Notify socket that messages were read
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat:read',
            toUserId: targetId,
          })
        );
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'خطا در بارگذاری پیام‌ها');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // 3. Switch active user conversation
  const setActiveUserId = useCallback(
    (targetId: string | null) => {
      setActiveUserIdState(targetId);
      if (targetId) {
        loadMessages(targetId);
      } else {
        setMessages([]);
      }
    },
    [loadMessages]
  );

  // Initial conversations load on auth
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token, loadConversations]);

  // Initial messages load if initialTargetUserId provided
  useEffect(() => {
    if (initialTargetUserId) {
      setActiveUserId(initialTargetUserId);
    }
  }, [initialTargetUserId, setActiveUserId]);

  // 4. WebSocket setup & lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!token) {
      setConnectionStatus('disconnected');
      return;
    }

    let isSubscribed = true;

    const connectWebSocket = () => {
      if (!isSubscribed) return;

      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws/chat';
      const wsUrl = `${wsBaseUrl}?token=${encodeURIComponent(token)}`;

      setConnectionStatus('connecting');

      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          if (!isSubscribed) return;
          setConnectionStatus('connected');
          setError(null);

          // Setup ping heartbeat every 25s
          if (pingTimerRef.current) clearInterval(pingTimerRef.current);
          pingTimerRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'pong') {
              return;
            }

            // Real-time message received
            if (data.type === 'chat:message' && data.message) {
              const incomingMsg: DirectMessage = data.message;
              const currentTarget = activeUserIdRef.current;
              const currentUserId = userRef.current?.id;

              // If message belongs to current active thread
              if (
                currentTarget &&
                (incomingMsg.senderId === currentTarget || incomingMsg.receiverId === currentTarget)
              ) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === incomingMsg.id)) {
                    return prev;
                  }
                  return [...prev, incomingMsg];
                });

                // If we are currently active in this chat and it came from the partner, mark as read
                if (incomingMsg.senderId === currentTarget) {
                  chatService.markRead(currentTarget).catch(() => {});
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(
                      JSON.stringify({
                        type: 'chat:read',
                        toUserId: currentTarget,
                      })
                    );
                  }
                }
              }

              // Update conversation summaries
              const partnerId =
                incomingMsg.senderId === currentUserId
                  ? incomingMsg.receiverId
                  : incomingMsg.senderId;

              let partnerFound = false;

              setConversations((prev) => {
                const existingIndex = prev.findIndex((c) => c.userId === partnerId);
                const isCurrentActive = partnerId === activeUserIdRef.current;

                if (existingIndex >= 0) {
                  partnerFound = true;
                  const updated = [...prev];
                  const existing = updated[existingIndex];
                  const newUnread =
                    incomingMsg.senderId !== currentUserId && !isCurrentActive
                      ? existing.unreadCount + 1
                      : existing.unreadCount;

                  updated[existingIndex] = {
                    ...existing,
                    lastMessage: incomingMsg,
                    unreadCount: newUnread,
                  };

                  // Move to top
                  const [item] = updated.splice(existingIndex, 1);
                  return [item, ...updated];
                }
                return prev;
              });

              // If this was a new conversation partner not yet in list, refresh conversations
              if (!partnerFound) {
                loadConversations();
              }
            }

            // Read receipts event
            if (data.type === 'chat:read' && data.readerId) {
              const readerId = data.readerId;
              if (activeUserIdRef.current === readerId) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.receiverId === readerId ? { ...m, read: true } : m
                  )
                );
              }
            }

            // Typing indicator event
            if (data.type === 'chat:typing' && data.fromUserId) {
              if (data.fromUserId === activeUserIdRef.current) {
                setIsPartnerTyping(!!data.isTyping);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                if (data.isTyping) {
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsPartnerTyping(false);
                  }, 3000);
                }
              }
            }

            if (data.type === 'chat:error') {
              setError(data.message || 'خطا در وب‌سوکت چت');
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        socket.onerror = () => {
          // WebSocket connection dropped or backend starting up:
          // Fall back gracefully to HTTP REST without red Next.js console overlay
          setConnectionStatus('disconnected');
        };

        socket.onclose = (event) => {
          if (!isSubscribed) return;
          setConnectionStatus('disconnected');

          if (pingTimerRef.current) {
            clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
          }

          // Code 1008 is auth failure - do not reconnect automatically
          if (event.code === 1008) {
            setError('احراز هویت وب‌سوکت چت با خطا مواجه شد');
            return;
          }

          if (event.code !== 1000 && isSubscribed) {
            reconnectTimerRef.current = setTimeout(() => {
              connectWebSocket();
            }, 3000);
          }
        };
      } catch (err: any) {
        console.error('Failed to create WebSocket:', err);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
        socketRef.current = null;
      }
    };
  }, [token, loadConversations]);

  // Send typing notification to active partner
  const sendTyping = useCallback((isTyping: boolean) => {
    const targetId = activeUserIdRef.current;
    if (!targetId) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'chat:typing',
          toUserId: targetId,
          isTyping,
        })
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (
      contentOrPayload: string | SendMessagePayload,
      options?: { mediaUrl?: string; documentUrl?: string; documentName?: string }
    ): Promise<DirectMessage | void> => {
      let toUserId: string | undefined;
      let content: string;
      let mediaUrl: string | undefined;
      let documentUrl: string | undefined;
      let documentName: string | undefined;

      if (typeof contentOrPayload === 'string') {
        content = contentOrPayload;
        toUserId = activeUserId || undefined;
        mediaUrl = options?.mediaUrl;
        documentUrl = options?.documentUrl;
        documentName = options?.documentName;
      } else {
        content = contentOrPayload.content;
        toUserId = contentOrPayload.toUserId || activeUserId || undefined;
        mediaUrl = contentOrPayload.mediaUrl;
        documentUrl = contentOrPayload.documentUrl;
        documentName = contentOrPayload.documentName;
      }

      if (!toUserId) {
        throw new Error('کاربر دریافت‌کننده انتخاب نشده است');
      }

      if (!content || !content.trim()) {
        throw new Error('متن پیام نمی‌تواند خالی باشد');
      }

      // Stop typing indicator on send
      sendTyping(false);

      // Try via WebSocket first if connected
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat:send',
            toUserId,
            content: content.trim(),
            mediaUrl,
            documentUrl,
            documentName,
          })
        );
        return;
      }

      // Fallback to REST API if WebSocket is not currently connected
      const saved = await chatService.sendMessage(toUserId, {
        content: content.trim(),
        mediaUrl,
        documentUrl,
        documentName,
      });

      // Update messages locally if current thread
      if (toUserId === activeUserId) {
        setMessages((prev) => [...prev, saved]);
      }

      // Update conversations
      loadConversations();
      return saved;
    },
    [activeUserId, loadConversations, sendTyping]
  );

  return {
    // State
    activeUserId,
    messages,
    conversations,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isLoadingMessages,
    isLoadingConversations,
    isPartnerTyping,
    error,

    // Actions
    setActiveUserId,
    sendMessage,
    sendTyping,
    loadConversations,
    loadMessages,
  };
}

export default useChat;
