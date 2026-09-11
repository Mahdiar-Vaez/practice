import { describe, it, expect, beforeEach } from 'vitest';
import { ChatService } from './chat.service.js';
import { MockChatRepository } from '../repositories/mock-chat.repository.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';
import { HandleError } from '../errors/handle-error.js';

describe('ChatService', () => {
  let chatRepo: MockChatRepository;
  let userRepo: MockUserRepository;
  let chatService: ChatService;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    chatRepo = new MockChatRepository(userRepo);
    chatService = new ChatService(chatRepo, userRepo);
  });

  it('should send a direct message between valid users', async () => {
    const msg = await chatService.sendMessage('usr_demo_123', {
      receiverId: 'usr_sara_456',
      content: 'سلام سارا، وضعیت پروژه چطور است؟',
    });

    expect(msg.id).toBeDefined();
    expect(msg.senderId).toBe('usr_demo_123');
    expect(msg.receiverId).toBe('usr_sara_456');
    expect(msg.content).toBe('سلام سارا، وضعیت پروژه چطور است؟');
  });

  it('should reject sending message to non-existent receiver', async () => {
    await expect(
      chatService.sendMessage('usr_demo_123', {
        receiverId: 'usr_non_existent',
        content: 'تست',
      })
    ).rejects.toThrow(HandleError);
  });

  it('should reject sending message to self', async () => {
    await expect(
      chatService.sendMessage('usr_demo_123', {
        receiverId: 'usr_demo_123',
        content: 'سلام به خودم',
      })
    ).rejects.toThrow(HandleError);
  });

  it('should reject empty message content', async () => {
    await expect(
      chatService.sendMessage('usr_demo_123', {
        receiverId: 'usr_sara_456',
        content: '   ',
      })
    ).rejects.toThrow(HandleError);
  });

  it('should fetch message history and automatically mark incoming messages as read', async () => {
    const messages = await chatService.getMessages('usr_demo_123', 'usr_sara_456');
    expect(messages.length).toBeGreaterThan(0);

    const conversations = await chatService.getConversations('usr_demo_123');
    const saraConvo = conversations.find((c) => c.userId === 'usr_sara_456');
    expect(saraConvo?.unreadCount).toBe(0);
  });

  it('should fetch user conversations list', async () => {
    const convos = await chatService.getConversations('usr_demo_123');
    expect(convos.length).toBeGreaterThanOrEqual(2);
  });
});
