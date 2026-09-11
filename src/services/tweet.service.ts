import api from '@/lib/api';
import { ApiResponse, TweetData, CommentData } from '@/types/api';

export const tweetService = {
  async getFeed(): Promise<TweetData[]> {
    const res = await api.get<ApiResponse<{ tweets: TweetData[] }>>('/tweets');
    return res.data.data?.tweets || [];
  },

  async createTweet(content: string, mediaUrl?: string): Promise<TweetData> {
    const res = await api.post<ApiResponse<{ tweet: TweetData }>>('/tweets', { content, mediaUrl });
    return res.data.data!.tweet;
  },

  async toggleLike(tweetId: string): Promise<{ liked: boolean; likesCount: number }> {
    const res = await api.post<ApiResponse<{ liked: boolean; likesCount: number }>>(`/tweets/${tweetId}/like`);
    return res.data.data!;
  },

  async getComments(tweetId: string): Promise<CommentData[]> {
    const res = await api.get<ApiResponse<{ comments: CommentData[] }>>(`/tweets/${tweetId}/comments`);
    return res.data.data?.comments || [];
  },

  async addComment(tweetId: string, content: string): Promise<CommentData> {
    const res = await api.post<ApiResponse<{ comment: CommentData }>>(`/tweets/${tweetId}/comments`, { content });
    return res.data.data!.comment;
  },
};

export default tweetService;
