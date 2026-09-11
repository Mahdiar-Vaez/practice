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

export interface SendMessageDTO {
  receiverId: string;
  content: string;
  mediaUrl?: string;
  documentUrl?: string;
  documentName?: string;
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

export interface ChatSendPayload {
  type: 'chat:send';
  toUserId: string;
  content: string;
  mediaUrl?: string;
  documentUrl?: string;
  documentName?: string;
}

export interface ChatMessagePayload {
  type: 'chat:message';
  message: DirectMessage;
}

export interface ChatErrorPayload {
  type: 'chat:error';
  message: string;
}

export interface ChatPingPayload {
  type: 'ping';
}

export interface ChatPongPayload {
  type: 'pong';
}

export type ChatIncomingMessage = ChatSendPayload | ChatPingPayload | Record<string, any>;
export type ChatOutgoingMessage = ChatMessagePayload | ChatPongPayload | ChatErrorPayload;
