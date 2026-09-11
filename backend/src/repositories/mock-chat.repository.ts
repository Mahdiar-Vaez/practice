import { DirectMessage, ConversationSummary } from '../types/chat.types.js';
import { IChatRepository } from './chat.repository.interface.js';
import { IUserRepository } from './user.repository.interface.js';
import { userRepository } from './mock-user.repository.js';

export class MockChatRepository implements IChatRepository {
  private messages: DirectMessage[] = [];

  constructor(private userRepo: IUserRepository = userRepository) {
    this.seed();
  }

  private seed(): void {
    const now = Date.now();

    this.messages = [
      {
        id: 'msg_seed_1',
        senderId: 'usr_sara_456',
        receiverId: 'usr_demo_123',
        content: 'سلام وقت بخیر! آیا کامپوننت‌های جدید رابط کاربری چت پیاده‌سازی شدند؟',
        createdAt: new Date(now - 2 * 3600 * 1000).toISOString(),
        read: true,
      },
      {
        id: 'msg_seed_2',
        senderId: 'usr_demo_123',
        receiverId: 'usr_sara_456',
        content: 'سلام سارا جان، بله معماری وب‌سوکت و ساختار تبادل ریل‌تایم پیام‌ها با موفقیت پیاده‌سازی شد.',
        createdAt: new Date(now - 1.5 * 3600 * 1000).toISOString(),
        read: true,
      },
      {
        id: 'msg_seed_3',
        senderId: 'usr_sara_456',
        receiverId: 'usr_demo_123',
        content: 'فوق‌العادست! طرح مستندات را برای هماهنگی فرانت‌اِند ارسال کردم، لطفاً بررسی کن.',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        documentUrl: 'https://example.com/docs/chat-spec.pdf',
        documentName: 'chat-spec.pdf',
        createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: 'msg_seed_4',
        senderId: 'usr_reza_789',
        receiverId: 'usr_demo_123',
        content: 'سلام، جلسه بررسی یکپارچه‌سازی وب‌سوکت فردا ساعت ۱۱ برگزار می‌شود.',
        createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
        read: false,
      },
    ];
  }

  async saveMessage(data: Omit<DirectMessage, 'id' | 'createdAt' | 'read'>): Promise<DirectMessage> {
    const message: DirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      documentUrl: data.documentUrl,
      documentName: data.documentName,
      createdAt: new Date().toISOString(),
      read: false,
    };

    this.messages.push(message);
    return { ...message };
  }

  async getMessagesBetween(userA: string, userB: string): Promise<DirectMessage[]> {
    return this.messages
      .filter(
        (m) =>
          (m.senderId === userA && m.receiverId === userB) ||
          (m.senderId === userB && m.receiverId === userA)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((m) => ({ ...m }));
  }

  async getConversationsFor(userId: string): Promise<ConversationSummary[]> {
    const userMessages = this.messages.filter(
      (m) => m.senderId === userId || m.receiverId === userId
    );

    const partnerIds = new Set<string>();
    for (const m of userMessages) {
      const partnerId = m.senderId === userId ? m.receiverId : m.senderId;
      partnerIds.add(partnerId);
    }

    const conversations: ConversationSummary[] = [];

    for (const partnerId of partnerIds) {
      const thread = this.messages
        .filter(
          (m) =>
            (m.senderId === userId && m.receiverId === partnerId) ||
            (m.senderId === partnerId && m.receiverId === userId)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (thread.length === 0) continue;

      const lastMessage = thread[thread.length - 1];
      const unreadCount = thread.filter(
        (m) => m.receiverId === userId && m.senderId === partnerId && !m.read
      ).length;

      const partnerUser = await this.userRepo.findById(partnerId);

      conversations.push({
        userId: partnerId,
        user: {
          id: partnerId,
          name: partnerUser ? partnerUser.name : 'کاربر توییتر',
          username: partnerUser ? partnerUser.username : 'user',
          avatar:
            partnerUser?.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        },
        lastMessage: { ...lastMessage },
        unreadCount,
      });
    }

    // Sort by latest message date descending
    return conversations.sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  async markAsRead(userA: string, userB: string): Promise<void> {
    for (const m of this.messages) {
      if (m.receiverId === userA && m.senderId === userB && !m.read) {
        m.read = true;
      }
    }
  }
}

export const chatRepository = new MockChatRepository();
