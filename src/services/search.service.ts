import api from '@/lib/api';
import { ApiResponse, TweetData, User } from '@/types/api';

export interface TrendingHashtag {
  tag: string;
  count: number;
}

export interface SearchResult {
  tweets: TweetData[];
  users: User[];
}

export const searchService = {
  async search(q: string): Promise<SearchResult> {
    const res = await api.get<ApiResponse<SearchResult>>(`/search?q=${encodeURIComponent(q)}`);
    return res.data.data || { tweets: [], users: [] };
  },

  async getHashtagTweets(tag: string): Promise<TweetData[]> {
    const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
    const res = await api.get<ApiResponse<{ tweets: TweetData[] }>>(
      `/search/hashtags/${encodeURIComponent(cleanTag)}`
    );
    return res.data.data?.tweets || [];
  },

  async getTrending(): Promise<TrendingHashtag[]> {
    const res = await api.get<ApiResponse<{ hashtags: TrendingHashtag[]; trending?: TrendingHashtag[] }>>(
      '/search/trending'
    );
    return res.data.data?.hashtags || res.data.data?.trending || [];
  },
};

export default searchService;
