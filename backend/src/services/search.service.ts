import { tweetRepository, MockTweetRepository } from '../repositories/mock-tweet.repository.js';
import { userRepository, MockUserRepository } from '../repositories/mock-user.repository.js';
import { ITweetRepository } from '../repositories/tweet.repository.interface.js';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { PopulatedTweet, Tweet } from '../types/tweet.types.js';
import { User } from '../types/user.types.js';

export interface TrendingHashtag {
  tag: string;
  count: number;
}

export interface SearchResult {
  tweets: PopulatedTweet[];
  users: User[];
}

export class SearchService {
  constructor(
    private tweetRepo: ITweetRepository = tweetRepository,
    private userRepo: IUserRepository = userRepository
  ) {}

  /**
   * فرمت کردن زمان نسبی به زبان فارسی
   */
  private formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const diff = Math.max(0, now - new Date(dateStr).getTime());
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'همین الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    return `${days} روز پیش`;
  }

  /**
   * بارگذاری اطلاعات نویسنده و وضعیت لایک برای توییت‌ها
   */
  private async populateTweets(tweets: Tweet[], currentUserId?: string): Promise<PopulatedTweet[]> {
    const users = await this.userRepo.getAll();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const populated: PopulatedTweet[] = [];
    for (const t of tweets) {
      const author = userMap.get(t.authorId);
      const isLiked = currentUserId ? await this.tweetRepo.isLiked(t.id, currentUserId) : false;

      populated.push({
        id: t.id,
        content: t.content,
        mediaUrl: t.mediaUrl,
        likesCount: t.likesCount,
        commentsCount: t.commentsCount,
        repostsCount: t.repostsCount,
        views: t.views,
        createdAt: t.createdAt,
        time: this.formatRelativeTime(t.createdAt),
        isLiked,
        author: {
          name: author ? author.name : 'کاربر توییتر',
          handle: author ? `@${author.username}` : '@user',
          avatar: author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          verified: true,
        },
      });
    }

    return populated;
  }

  /**
   * جستجوی بدون حساسیت به حروف بزرگ و کوچک در محتوای توییت‌ها و کاربران (نام و نام‌کاربری)
   */
  async search(query: string, currentUserId?: string): Promise<SearchResult> {
    if (!query || !query.trim()) {
      return { tweets: [], users: [] };
    }

    const q = query.trim().toLowerCase();
    const cleanUserQ = q.startsWith('@') ? q.slice(1) : q;

    const allTweets = await this.tweetRepo.findAll();
    const matchingTweets = allTweets.filter((t) =>
      t.content.toLowerCase().includes(q)
    );

    const populatedTweets = await this.populateTweets(matchingTweets, currentUserId);

    const allUsers = await this.userRepo.getAll();
    const matchingUsers = allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(cleanUserQ)
    );

    return {
      tweets: populatedTweets,
      users: matchingUsers,
    };
  }

  /**
   * دریافت توییت‌های مرتبط با یک هشتگ خاص
   */
  async getHashtagTweets(tag: string, currentUserId?: string): Promise<PopulatedTweet[]> {
    if (!tag || !tag.trim()) {
      return [];
    }

    const cleanTag = tag.trim().replace(/^#+/, '');
    if (!cleanTag) {
      return [];
    }

    const searchTag = '#' + cleanTag.toLowerCase();
    const allTweets = await this.tweetRepo.findAll();
    const matchingTweets = allTweets.filter((t) =>
      t.content.toLowerCase().includes(searchTag)
    );

    return this.populateTweets(matchingTweets, currentUserId);
  }

  /**
   * استخراج تمام هشتگ‌ها و مرتب‌سازی بر اساس تعداد استفاده (ترندها)
   */
  async getTrendingHashtags(): Promise<TrendingHashtag[]> {
    const allTweets = await this.tweetRepo.findAll();
    const countMap = new Map<string, { tag: string; count: number }>();

    // تطبیق با هشتگ‌های فارسی و انگلیسی و شامل نیم‌فاصله‌ها
    const hashtagRegex = /#([\p{L}\p{N}_\u200c]+)/gu;

    for (const tweet of allTweets) {
      const matches = tweet.content.matchAll(hashtagRegex);
      for (const match of matches) {
        const rawTag = match[1];
        if (!rawTag) continue;
        const normalizedKey = rawTag.toLowerCase();
        const existing = countMap.get(normalizedKey);
        if (existing) {
          existing.count += 1;
        } else {
          countMap.set(normalizedKey, { tag: rawTag, count: 1 });
        }
      }
    }

    return Array.from(countMap.values()).sort((a, b) => b.count - a.count);
  }
}

export const searchService = new SearchService(tweetRepository, userRepository);
