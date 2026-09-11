export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  documentUrl?: string;
  documentName?: string;
  createdAt: string;
  read: boolean;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ConversationSummary {
  userId: string;
  user: ConversationParticipant;
  lastMessage: DirectMessage;
  unreadCount: number;
}

export interface SendMessagePayload {
  toUserId?: string;
  content: string;
  mediaUrl?: string;
  documentUrl?: string;
  documentName?: string;
}

export type ChatConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
