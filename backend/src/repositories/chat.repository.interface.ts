import { DirectMessage, ConversationSummary } from '../types/chat.types.js';

export interface IChatRepository {
  saveMessage(data: Omit<DirectMessage, 'id' | 'createdAt' | 'read'>): Promise<DirectMessage>;
  getMessagesBetween(userA: string, userB: string): Promise<DirectMessage[]>;
  getConversationsFor(userId: string): Promise<ConversationSummary[]>;
  markAsRead(userA: string, userB: string): Promise<void>;
}
