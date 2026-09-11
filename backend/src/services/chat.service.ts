import { IChatRepository } from '../repositories/chat.repository.interface.js';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { chatRepository } from '../repositories/mock-chat.repository.js';
import { userRepository } from '../repositories/mock-user.repository.js';
import { DirectMessage, SendMessageDTO, ConversationSummary } from '../types/chat.types.js';
import { HandleError } from '../errors/handle-error.js';

export class ChatService {
  constructor(
    private chatRepo: IChatRepository = chatRepository,
    private userRepo: IUserRepository = userRepository
  ) {}

  async sendMessage(senderId: string, data: SendMessageDTO): Promise<DirectMessage> {
    if (!data.receiverId) {
      throw HandleError.badRequest('شناسه کاربر دریافت‌کننده الزامی است');
    }

    if (senderId === data.receiverId) {
      throw HandleError.badRequest('امکان ارسال پیام به خود وجود ندارد');
    }

    const receiver = await this.userRepo.findById(data.receiverId);
    if (!receiver) {
      throw HandleError.notFound('کاربر دریافت‌کننده یافت نشد');
    }

    if (!data.content || !data.content.trim()) {
      throw HandleError.badRequest('متن پیام نمی‌تواند خالی باشد');
    }

    const message = await this.chatRepo.saveMessage({
      senderId,
      receiverId: data.receiverId,
      content: data.content.trim(),
      mediaUrl: data.mediaUrl,
      documentUrl: data.documentUrl,
      documentName: data.documentName,
    });

    return message;
  }

  async getMessages(currentUserId: string, targetUserId: string): Promise<DirectMessage[]> {
    if (!targetUserId) {
      throw HandleError.badRequest('شناسه کاربر مقابل الزامی است');
    }

    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    // Automatically mark incoming messages as read
    await this.chatRepo.markAsRead(currentUserId, targetUserId);

    return await this.chatRepo.getMessagesBetween(currentUserId, targetUserId);
  }

  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw HandleError.notFound('کاربر یافت نشد');
    }

    return await this.chatRepo.getConversationsFor(userId);
  }

  async markRead(currentUserId: string, targetUserId: string): Promise<void> {
    if (!targetUserId) {
      throw HandleError.badRequest('شناسه کاربر مقابل الزامی است');
    }

    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    await this.chatRepo.markAsRead(currentUserId, targetUserId);
  }
}

export const chatService = new ChatService();
