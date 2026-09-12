import { query } from '../db/index.js';
import { DirectMessage, ConversationSummary } from '../types/chat.types.js';
import { IChatRepository } from './chat.repository.interface.js';
import { IUserRepository } from './user.repository.interface.js';

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url: string | null;
  document_url: string | null;
  document_name: string | null;
  read: boolean;
  created_at: Date;
}

function mapRowToMessage(row: MessageRow): DirectMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    mediaUrl: row.media_url || undefined,
    documentUrl: row.document_url || undefined,
    documentName: row.document_name || undefined,
    read: Boolean(row.read),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export class PostgresChatRepository implements IChatRepository {
  constructor(private userRepo?: IUserRepository) {}

  setUserRepo(repo: IUserRepository) {
    this.userRepo = repo;
  }

  async saveMessage(data: Omit<DirectMessage, 'id' | 'createdAt' | 'read'>): Promise<DirectMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await query<MessageRow>(
      `INSERT INTO messages (id, sender_id, receiver_id, content, media_url, document_url, document_name, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW())
       RETURNING *`,
      [
        id,
        data.senderId,
        data.receiverId,
        data.content,
        data.mediaUrl || null,
        data.documentUrl || null,
        data.documentName || null,
      ]
    );
    return mapRowToMessage(res.rows[0]);
  }

  async getMessagesBetween(userA: string, userB: string): Promise<DirectMessage[]> {
    const res = await query<MessageRow>(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userA, userB]
    );
    return res.rows.map(mapRowToMessage);
  }

  async getConversationsFor(userId: string): Promise<ConversationSummary[]> {
    // Find all distinct partner ids
    const partnersRes = await query<{ partner_id: string }>(
      `SELECT DISTINCT
         CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partner_id
       FROM messages
       WHERE sender_id = $1 OR receiver_id = $1`,
      [userId]
    );

    const conversations: ConversationSummary[] = [];

    for (const row of partnersRes.rows) {
      const partnerId = row.partner_id;
      if (!partnerId) continue;

      // Get latest message in thread
      const lastMsgRes = await query<MessageRow>(
        `SELECT * FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, partnerId]
      );

      if (!lastMsgRes.rows[0]) continue;

      const lastMessage = mapRowToMessage(lastMsgRes.rows[0]);

      // Count unread messages received by userId from partnerId
      const unreadRes = await query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM messages
         WHERE receiver_id = $1 AND sender_id = $2 AND read = FALSE`,
        [userId, partnerId]
      );
      const unreadCount = parseInt(unreadRes.rows[0]?.count || '0', 10);

      // Get partner info
      let partnerUser = this.userRepo ? await this.userRepo.findById(partnerId) : null;
      if (!partnerUser) {
        const uRes = await query<{ id: string; name: string; username: string; avatar: string | null }>(
          'SELECT id, name, username, avatar FROM users WHERE id = $1 LIMIT 1',
          [partnerId]
        );
        if (uRes.rows[0]) {
          partnerUser = {
            id: uRes.rows[0].id,
            name: uRes.rows[0].name,
            username: uRes.rows[0].username,
            avatar: uRes.rows[0].avatar || '',
            email: '',
            password: '',
            createdAt: '',
          };
        }
      }

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
        lastMessage,
        unreadCount,
      });
    }

    return conversations.sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  async markAsRead(userA: string, userB: string): Promise<void> {
    // userA is reader, userB is sender
    await query(
      'UPDATE messages SET read = TRUE WHERE receiver_id = $1 AND sender_id = $2 AND read = FALSE',
      [userA, userB]
    );
  }
}
