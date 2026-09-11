import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { DirectMessage, ConversationSummary } from '@/types/chat';

export interface SendMessageParams {
  content: string;
  mediaUrl?: string;
  documentUrl?: string;
  documentName?: string;
}

export const chatService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const res = await api.get<ApiResponse<{ conversations: ConversationSummary[] }>>('/chats');
    return res.data.data?.conversations || [];
  },

  async getMessages(targetId: string): Promise<DirectMessage[]> {
    const res = await api.get<ApiResponse<{ messages: DirectMessage[] }>>(`/chats/${targetId}/messages`);
    return res.data.data?.messages || [];
  },

  async sendMessage(targetId: string, data: SendMessageParams): Promise<DirectMessage> {
    const res = await api.post<ApiResponse<{ message: DirectMessage }>>(`/chats/${targetId}/messages`, data);
    return res.data.data!.message;
  },

  async markRead(targetId: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/chats/${targetId}/read`);
  },
};

export default chatService;
