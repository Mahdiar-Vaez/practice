export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  avatar?: string;
}


export interface Author {
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
}

export interface TweetData {
  id: string;
  author: Author;
  time: string;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount?: number;
  views?: string;
  isLiked?: boolean;
  stats?: {
    replies: number;
    reposts: number;
    likes: number;
    views: string;
  };
}

export interface CommentData {
  id: string;
  tweetId: string;
  author: Author;
  content: string;
  time: string;
  createdAt: string;
}

