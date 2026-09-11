import { Tweet, Comment, CreateTweetDTO, CreateCommentDTO } from '../types/tweet.types.js';
import { ITweetRepository } from './tweet.repository.interface.js';

export class MockTweetRepository implements ITweetRepository {
  private tweets: Tweet[] = [];
  private comments: Comment[] = [];
  private likes: Map<string, Set<string>> = new Map(); // tweetId -> Set of userIds

  constructor() {
    this.seed();
  }

  private seed() {
    this.tweets = [
      {
        id: 'tweet_1',
        authorId: 'usr_demo_123',
        content: 'نسخه ۱۶ نکست‌جی‌اس با کامپایل توربوپک فوق‌سریع، پشتیبانی رسمی از ری‌اکت ۱۹ و ارتقای چشمگیر سرور اکشن‌ها منتشر شد! 🚀\n\nبرای شروع دستور npx create-next-app@latest را اجرا کنید.',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        likesCount: 5890,
        commentsCount: 2,
        repostsCount: 1204,
        views: '۱۴۲K',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tweet_2',
        authorId: 'usr_demo_123',
        content: 'ترکیب متریال یو‌آی نسخه ۶ با اپ‌روتر نکست‌جی‌اس و پشتیبانی کامل از حالت تاریک OLED و چیدمان راست‌چین (RTL)، تجربه‌ای کاملاً بومی و روان را برای کاربران فارسی‌زبان فراهم می‌کند.\n\n#ری‌اکت #توسعه_وب #طراحی_رابط_کاربری',
        likesCount: 1430,
        commentsCount: 1,
        repostsCount: 215,
        views: '۴۵.۸K',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tweet_3',
        authorId: 'usr_demo_123',
        content: 'طراحی ۳ ستونه مدرن با تراکم مناسب اطلاعات، مرزبندی‌های ظریف و انیمیشن‌های روان فیزیکی، همواره استاندارد طلایی داشبوردهای تعاملی و شبکه‌های اجتماعی است.',
        mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        likesCount: 890,
        commentsCount: 0,
        repostsCount: 132,
        views: '۲۸.۱K',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ];

    this.comments = [
      {
        id: 'cmt_1',
        tweetId: 'tweet_1',
        authorId: 'usr_demo_123',
        content: 'سرعت کامپایل توربوپک واقعاً شگفت‌انگیزه!',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
      {
        id: 'cmt_2',
        tweetId: 'tweet_1',
        authorId: 'usr_demo_123',
        content: 'آیا با ری‌اکت ۱۹ به صورت کامل سازگاره؟',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmt_3',
        tweetId: 'tweet_2',
        authorId: 'usr_demo_123',
        content: 'راست‌چین کردن متریال یو‌آی با فونت وزیرمتن فوق‌العاده شده.',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ];
  }

  async findAll(): Promise<Tweet[]> {
    return [...this.tweets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id: string): Promise<Tweet | null> {
    const tweet = this.tweets.find((t) => t.id === id);
    return tweet ? { ...tweet } : null;
  }

  async create(data: CreateTweetDTO): Promise<Tweet> {
    const newTweet: Tweet = {
      id: `tweet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: data.authorId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      views: '۱',
      createdAt: new Date().toISOString(),
    };
    this.tweets.unshift(newTweet);
    return { ...newTweet };
  }

  async toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    if (!this.likes.has(tweetId)) {
      this.likes.set(tweetId, new Set());
    }
    const tweetLikes = this.likes.get(tweetId)!;
    const tweet = this.tweets.find((t) => t.id === tweetId);

    let liked = false;
    if (tweetLikes.has(userId)) {
      tweetLikes.delete(userId);
      liked = false;
      if (tweet && tweet.likesCount > 0) tweet.likesCount -= 1;
    } else {
      tweetLikes.add(userId);
      liked = true;
      if (tweet) tweet.likesCount += 1;
    }

    return { liked, count: tweet ? tweet.likesCount : tweetLikes.size };
  }

  async isLiked(tweetId: string, userId: string): Promise<boolean> {
    const tweetLikes = this.likes.get(tweetId);
    return tweetLikes ? tweetLikes.has(userId) : false;
  }

  async getComments(tweetId: string): Promise<Comment[]> {
    return this.comments
      .filter((c) => c.tweetId === tweetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addComment(tweetId: string, data: CreateCommentDTO): Promise<Comment> {
    const newComment: Comment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tweetId,
      authorId: data.authorId,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
    this.comments.push(newComment);

    const tweet = this.tweets.find((t) => t.id === tweetId);
    if (tweet) {
      tweet.commentsCount += 1;
    }

    return { ...newComment };
  }
}

export const tweetRepository = new MockTweetRepository();
