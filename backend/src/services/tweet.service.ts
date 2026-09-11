import { ITweetRepository } from '../repositories/tweet.repository.interface.js';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { PopulatedTweet, PopulatedComment } from '../types/tweet.types.js';
import { HandleError } from '../errors/handle-error.js';

export class TweetService {
  constructor(
    private tweetRepo: ITweetRepository,
    private userRepo: IUserRepository
  ) {}

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

  async getFeed(currentUserId?: string): Promise<PopulatedTweet[]> {
    const tweets = await this.tweetRepo.findAll();
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

  async createTweet(authorId: string, data: { content: string; mediaUrl?: string }): Promise<PopulatedTweet> {
    const user = await this.userRepo.findById(authorId);
    if (!user) {
      throw HandleError.unauthorized('کاربر معتبر نیست');
    }

    const tweet = await this.tweetRepo.create({
      authorId,
      content: data.content,
      mediaUrl: data.mediaUrl,
    });

    return {
      id: tweet.id,
      content: tweet.content,
      mediaUrl: tweet.mediaUrl,
      likesCount: tweet.likesCount,
      commentsCount: tweet.commentsCount,
      repostsCount: tweet.repostsCount,
      views: tweet.views,
      createdAt: tweet.createdAt,
      time: 'همین الان',
      isLiked: false,
      author: {
        name: user.name,
        handle: `@${user.username}`,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        verified: true,
      },
    };
  }

  async toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const tweet = await this.tweetRepo.findById(tweetId);
    if (!tweet) {
      throw HandleError.notFound('پست مورد نظر یافت نشد');
    }

    const result = await this.tweetRepo.toggleLike(tweetId, userId);
    return { liked: result.liked, likesCount: result.count };
  }

  async getComments(tweetId: string): Promise<PopulatedComment[]> {
    const tweet = await this.tweetRepo.findById(tweetId);
    if (!tweet) {
      throw HandleError.notFound('پست مورد نظر یافت نشد');
    }

    const comments = await this.tweetRepo.getComments(tweetId);
    const users = await this.userRepo.getAll();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return comments.map((c) => {
      const author = userMap.get(c.authorId);
      return {
        id: c.id,
        tweetId: c.tweetId,
        content: c.content,
        createdAt: c.createdAt,
        time: this.formatRelativeTime(c.createdAt),
        author: {
          name: author ? author.name : 'کاربر توییتر',
          handle: author ? `@${author.username}` : '@user',
          avatar: author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          verified: true,
        },
      };
    });
  }

  async addComment(tweetId: string, authorId: string, data: { content: string }): Promise<PopulatedComment> {
    const tweet = await this.tweetRepo.findById(tweetId);
    if (!tweet) {
      throw HandleError.notFound('پست مورد نظر یافت نشد');
    }

    const user = await this.userRepo.findById(authorId);
    if (!user) {
      throw HandleError.unauthorized('کاربر معتبر نیست');
    }

    const comment = await this.tweetRepo.addComment(tweetId, {
      authorId,
      content: data.content,
    });

    return {
      id: comment.id,
      tweetId: comment.tweetId,
      content: comment.content,
      createdAt: comment.createdAt,
      time: 'همین الان',
      author: {
        name: user.name,
        handle: `@${user.username}`,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        verified: true,
      },
    };
  }
}
