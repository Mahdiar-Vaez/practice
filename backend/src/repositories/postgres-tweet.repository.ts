import { query } from '../db/index.js';
import { Tweet, Comment, CreateTweetDTO, CreateCommentDTO } from '../types/tweet.types.js';
import { ITweetRepository } from './tweet.repository.interface.js';

interface TweetRow {
  id: string;
  author_id: string;
  content: string;
  media_url: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views: string;
  created_at: Date;
}

interface CommentRow {
  id: string;
  tweet_id: string;
  author_id: string;
  content: string;
  created_at: Date;
}

function mapRowToTweet(row: TweetRow): Tweet {
  return {
    id: row.id,
    authorId: row.author_id,
    content: row.content,
    mediaUrl: row.media_url || undefined,
    likesCount: Number(row.likes_count) || 0,
    commentsCount: Number(row.comments_count) || 0,
    repostsCount: Number(row.reposts_count) || 0,
    views: row.views || '۱',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapRowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    tweetId: row.tweet_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export class PostgresTweetRepository implements ITweetRepository {
  async findAll(): Promise<Tweet[]> {
    const res = await query<TweetRow>('SELECT * FROM tweets ORDER BY created_at DESC');
    return res.rows.map(mapRowToTweet);
  }

  async findById(id: string): Promise<Tweet | null> {
    const res = await query<TweetRow>('SELECT * FROM tweets WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] ? mapRowToTweet(res.rows[0]) : null;
  }

  async create(data: CreateTweetDTO): Promise<Tweet> {
    const id = `tweet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await query<TweetRow>(
      `INSERT INTO tweets (id, author_id, content, media_url, likes_count, comments_count, reposts_count, views, created_at)
       VALUES ($1, $2, $3, $4, 0, 0, 0, '۱', NOW())
       RETURNING *`,
      [id, data.authorId, data.content, data.mediaUrl || null]
    );
    return mapRowToTweet(res.rows[0]);
  }

  async toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const existing = await query('SELECT 1 FROM likes WHERE tweet_id = $1 AND user_id = $2', [
      tweetId,
      userId,
    ]);

    if (existing.rowCount && existing.rowCount > 0) {
      await query('DELETE FROM likes WHERE tweet_id = $1 AND user_id = $2', [tweetId, userId]);
      const upd = await query<TweetRow>(
        'UPDATE tweets SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1 RETURNING likes_count',
        [tweetId]
      );
      const count = upd.rows[0] ? Number(upd.rows[0].likes_count) : 0;
      return { liked: false, count };
    } else {
      await query(
        'INSERT INTO likes (tweet_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [tweetId, userId]
      );
      const upd = await query<TweetRow>(
        'UPDATE tweets SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
        [tweetId]
      );
      const count = upd.rows[0] ? Number(upd.rows[0].likes_count) : 1;
      return { liked: true, count };
    }
  }

  async isLiked(tweetId: string, userId: string): Promise<boolean> {
    const res = await query('SELECT 1 FROM likes WHERE tweet_id = $1 AND user_id = $2 LIMIT 1', [
      tweetId,
      userId,
    ]);
    return (res.rowCount ?? 0) > 0;
  }

  async getComments(tweetId: string): Promise<Comment[]> {
    const res = await query<CommentRow>(
      'SELECT * FROM comments WHERE tweet_id = $1 ORDER BY created_at DESC',
      [tweetId]
    );
    return res.rows.map(mapRowToComment);
  }

  async addComment(tweetId: string, data: CreateCommentDTO): Promise<Comment> {
    const id = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await query<CommentRow>(
      `INSERT INTO comments (id, tweet_id, author_id, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, tweetId, data.authorId, data.content]
    );
    await query('UPDATE tweets SET comments_count = comments_count + 1 WHERE id = $1', [tweetId]);
    return mapRowToComment(res.rows[0]);
  }

  async findByAuthorId(authorId: string): Promise<Tweet[]> {
    const res = await query<TweetRow>(
      'SELECT * FROM tweets WHERE author_id = $1 ORDER BY created_at DESC',
      [authorId]
    );
    return res.rows.map(mapRowToTweet);
  }

  async findLikedByUser(userId: string): Promise<Tweet[]> {
    const res = await query<TweetRow>(
      `SELECT t.* FROM tweets t
       INNER JOIN likes l ON t.id = l.tweet_id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return res.rows.map(mapRowToTweet);
  }

  async findCommentsByAuthorId(authorId: string): Promise<Comment[]> {
    const res = await query<CommentRow>(
      'SELECT * FROM comments WHERE author_id = $1 ORDER BY created_at DESC',
      [authorId]
    );
    return res.rows.map(mapRowToComment);
  }

  async deleteUserData(userId: string): Promise<void> {
    await query('DELETE FROM comments WHERE author_id = $1', [userId]);
    await query('DELETE FROM likes WHERE user_id = $1', [userId]);
    await query('DELETE FROM tweets WHERE author_id = $1', [userId]);
  }
}
