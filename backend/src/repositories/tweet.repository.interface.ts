import { Tweet, Comment, CreateTweetDTO, CreateCommentDTO } from '../types/tweet.types.js';

export interface ITweetRepository {
  findAll(): Promise<Tweet[]>;
  findById(id: string): Promise<Tweet | null>;
  create(data: CreateTweetDTO): Promise<Tweet>;
  toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean; count: number }>;
  isLiked(tweetId: string, userId: string): Promise<boolean>;
  getComments(tweetId: string): Promise<Comment[]>;
  addComment(tweetId: string, data: CreateCommentDTO): Promise<Comment>;
  findByAuthorId(authorId: string): Promise<Tweet[]>;
  findLikedByUser(userId: string): Promise<Tweet[]>;
  findCommentsByAuthorId(authorId: string): Promise<Comment[]>;
  deleteUserData(userId: string): Promise<void>;
}

