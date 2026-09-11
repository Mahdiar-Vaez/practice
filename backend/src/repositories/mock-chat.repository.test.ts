import { describe, it, expect, beforeEach } from 'vitest';
import { MockChatRepository } from './mock-chat.repository.js';
import { MockUserRepository } from './mock-user.repository.js';

describe('MockChatRepository', () => {
  let chatRepo: MockChatRepository;
  let userRepo: MockUserRepository;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    chatRepo = new MockChatRepository(userRepo);
  });

  it('should initialize with sample seeded messages', async () => {
    const messages = await chatRepo.getMessagesBetween('usr_demo_123', 'usr_sara_456');
    expect(messages.length).toBeGreaterThanOrEqual(3);
    expect(messages[0].senderId).toBeDefined();
    expect(messages[0].receiverId).toBeDefined();
  });

  it('should save a new direct message and assign id and timestamp', async () => {
    const message = await chatRepo.saveMessage({
      senderId: 'usr_demo_123',
      receiverId: 'usr_sara_456',
      content: 'تست ذخیره پیام',
    });

    expect(message.id).toBeDefined();
    expect(message.createdAt).toBeDefined();
    expect(message.read).toBe(false);
    expect(message.content).toBe('تست ذخیره پیام');

    const thread = await chatRepo.getMessagesBetween('usr_demo_123', 'usr_sara_456');
    const found = thread.find((m) => m.id === message.id);
    expect(found).toBeDefined();
  });

  it('should return conversation summaries for a user', async () => {
    const conversations = await chatRepo.getConversationsFor('usr_demo_123');
    expect(conversations.length).toBeGreaterThanOrEqual(2);

    const saraConvo = conversations.find((c) => c.userId === 'usr_sara_456');
    expect(saraConvo).toBeDefined();
    expect(saraConvo?.user.name).toBe('سارا احمدی');
    expect(saraConvo?.lastMessage).toBeDefined();
    expect(typeof saraConvo?.unreadCount).toBe('number');
  });

  it('should mark messages as read', async () => {
    // usr_sara_456 sent an unread message to usr_demo_123 in seeds
    await chatRepo.markAsRead('usr_demo_123', 'usr_sara_456');

    const conversations = await chatRepo.getConversationsFor('usr_demo_123');
    const saraConvo = conversations.find((c) => c.userId === 'usr_sara_456');
    expect(saraConvo?.unreadCount).toBe(0);
  });
});
