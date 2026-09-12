import { IUserRepository } from '../repositories/user.repository.interface.js';
import { ITweetRepository } from '../repositories/tweet.repository.interface.js';
import { SafeUser, UpdateProfileDTO } from '../types/user.types.js';
import { PopulatedTweet, PopulatedComment } from '../types/tweet.types.js';
import { HandleError } from '../errors/handle-error.js';

export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private tweetRepo: ITweetRepository
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

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(excludeUserId?: string): Promise<SafeUser[]> {
    const users = await this.userRepo.getAll();
    return users
      .filter((u) => !excludeUserId || u.id !== excludeUserId)
      .map(({ password: _, ...safeUser }) => safeUser);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    const updated = await this.userRepo.update(userId, data);
    if (!updated) {
      throw HandleError.internal('خطا در به‌روزرسانی مشخصات کاربر');
    }

    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    // Cascade delete user tweets, comments, likes
    await this.tweetRepo.deleteUserData(userId);
    const deleted = await this.userRepo.delete(userId);

    if (!deleted) {
      throw HandleError.internal('خطا در حذف حساب کاربری');
    }

    return { success: true, message: 'حساب کاربری با موفقیت به صورت دائمی حذف شد' };
  }

  async getUserTweets(authorId: string, currentUserId?: string): Promise<PopulatedTweet[]> {
    const author = await this.userRepo.findById(authorId);
    if (!author) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    const tweets = await this.tweetRepo.findByAuthorId(authorId);
    const populated: PopulatedTweet[] = [];

    for (const t of tweets) {
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
          name: author.name,
          handle: `@${author.username}`,
          avatar: author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          verified: true,
        },
      });
    }

    return populated;
  }

  async getUserLikes(userId: string, currentUserId?: string): Promise<PopulatedTweet[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    const tweets = await this.tweetRepo.findLikedByUser(userId);
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

  async getUserComments(userId: string): Promise<PopulatedComment[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw HandleError.notFound('کاربر مورد نظر یافت نشد');
    }

    const comments = await this.tweetRepo.findCommentsByAuthorId(userId);
    return comments.map((c) => ({
      id: c.id,
      tweetId: c.tweetId,
      content: c.content,
      createdAt: c.createdAt,
      time: this.formatRelativeTime(c.createdAt),
      author: {
        name: user.name,
        handle: `@${user.username}`,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        verified: true,
      },
    }));
  }
}
