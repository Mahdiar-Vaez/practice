import api from '@/lib/api';
import { ApiResponse, User, TweetData, CommentData, UpdateProfileDTO } from '@/types/api';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/users');
    return res.data.data?.users || [];
  },

  async getProfile(userId?: string): Promise<User> {
    const endpoint = userId ? `/users/${userId}/profile` : '/users/profile';
    const res = await api.get<ApiResponse<{ user: User }>>(endpoint);
    return res.data.data!.user;
  },

  async updateProfile(data: UpdateProfileDTO): Promise<User> {
    const res = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return res.data.data!.user;
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<ApiResponse>('/users/account');
    return { success: res.data.success, message: res.data.message || '' };
  },

  async getUserTweets(userId: string): Promise<TweetData[]> {
    const res = await api.get<ApiResponse<{ tweets: TweetData[] }>>(`/users/${userId}/tweets`);
    return res.data.data?.tweets || [];
  },

  async getUserLikes(userId: string): Promise<TweetData[]> {
    const res = await api.get<ApiResponse<{ tweets: TweetData[] }>>(`/users/${userId}/likes`);
    return res.data.data?.tweets || [];
  },

  async getUserComments(userId: string): Promise<CommentData[]> {
    const res = await api.get<ApiResponse<{ comments: CommentData[] }>>(`/users/${userId}/comments`);
    return res.data.data?.comments || [];
  },
};

export default userService;
