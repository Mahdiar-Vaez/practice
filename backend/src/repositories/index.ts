import { isDatabaseConnected } from '../db/index.js';
import { IUserRepository } from './user.repository.interface.js';
import { ITweetRepository } from './tweet.repository.interface.js';
import { IChatRepository } from './chat.repository.interface.js';
import { MockUserRepository, userRepository as mockUserRepo } from './mock-user.repository.js';
import { MockTweetRepository, tweetRepository as mockTweetRepo } from './mock-tweet.repository.js';
import { MockChatRepository, chatRepository as mockChatRepo } from './mock-chat.repository.js';
import { PostgresUserRepository } from './postgres-user.repository.js';
import { PostgresTweetRepository } from './postgres-tweet.repository.js';
import { PostgresChatRepository } from './postgres-chat.repository.js';

export * from './user.repository.interface.js';
export * from './tweet.repository.interface.js';
export * from './chat.repository.interface.js';
export * from './mock-user.repository.js';
export * from './mock-tweet.repository.js';
export * from './mock-chat.repository.js';
export * from './postgres-user.repository.js';
export * from './postgres-tweet.repository.js';
export * from './postgres-chat.repository.js';

export const postgresUserRepository = new PostgresUserRepository();
export const postgresTweetRepository = new PostgresTweetRepository();
export const postgresChatRepository = new PostgresChatRepository(postgresUserRepository);

/**
 * Delegating User Repository:
 * Uses PostgreSQL if connected, otherwise smoothly falls back to mock repository
 */
export const userRepository: IUserRepository = {
  findByEmail: (email: string) =>
    isDatabaseConnected ? postgresUserRepository.findByEmail(email) : mockUserRepo.findByEmail(email),
  findByUsername: (username: string) =>
    isDatabaseConnected ? postgresUserRepository.findByUsername(username) : mockUserRepo.findByUsername(username),
  findByEmailOrUsername: (identifier: string) =>
    isDatabaseConnected
      ? postgresUserRepository.findByEmailOrUsername(identifier)
      : mockUserRepo.findByEmailOrUsername(identifier),
  findById: (id: string) =>
    isDatabaseConnected ? postgresUserRepository.findById(id) : mockUserRepo.findById(id),
  create: (data) =>
    isDatabaseConnected ? postgresUserRepository.create(data) : mockUserRepo.create(data),
  update: (id, data) =>
    isDatabaseConnected ? postgresUserRepository.update(id, data) : mockUserRepo.update(id, data),
  delete: (id: string) =>
    isDatabaseConnected ? postgresUserRepository.delete(id) : mockUserRepo.delete(id),
  getAll: () =>
    isDatabaseConnected ? postgresUserRepository.getAll() : mockUserRepo.getAll(),
};

/**
 * Delegating Tweet Repository:
 * Uses PostgreSQL if connected, otherwise smoothly falls back to mock repository
 */
export const tweetRepository: ITweetRepository = {
  findAll: () =>
    isDatabaseConnected ? postgresTweetRepository.findAll() : mockTweetRepo.findAll(),
  findById: (id: string) =>
    isDatabaseConnected ? postgresTweetRepository.findById(id) : mockTweetRepo.findById(id),
  create: (data) =>
    isDatabaseConnected ? postgresTweetRepository.create(data) : mockTweetRepo.create(data),
  toggleLike: (tweetId: string, userId: string) =>
    isDatabaseConnected
      ? postgresTweetRepository.toggleLike(tweetId, userId)
      : mockTweetRepo.toggleLike(tweetId, userId),
  isLiked: (tweetId: string, userId: string) =>
    isDatabaseConnected ? postgresTweetRepository.isLiked(tweetId, userId) : mockTweetRepo.isLiked(tweetId, userId),
  getComments: (tweetId: string) =>
    isDatabaseConnected ? postgresTweetRepository.getComments(tweetId) : mockTweetRepo.getComments(tweetId),
  addComment: (tweetId: string, data) =>
    isDatabaseConnected ? postgresTweetRepository.addComment(tweetId, data) : mockTweetRepo.addComment(tweetId, data),
  findByAuthorId: (authorId: string) =>
    isDatabaseConnected ? postgresTweetRepository.findByAuthorId(authorId) : mockTweetRepo.findByAuthorId(authorId),
  findLikedByUser: (userId: string) =>
    isDatabaseConnected ? postgresTweetRepository.findLikedByUser(userId) : mockTweetRepo.findLikedByUser(userId),
  findCommentsByAuthorId: (authorId: string) =>
    isDatabaseConnected
      ? postgresTweetRepository.findCommentsByAuthorId(authorId)
      : mockTweetRepo.findCommentsByAuthorId(authorId),
  deleteUserData: (userId: string) =>
    isDatabaseConnected ? postgresTweetRepository.deleteUserData(userId) : mockTweetRepo.deleteUserData(userId),
};

/**
 * Delegating Chat Repository:
 * Uses PostgreSQL if connected, otherwise smoothly falls back to mock repository
 */
export const chatRepository: IChatRepository = {
  saveMessage: (data) =>
    isDatabaseConnected ? postgresChatRepository.saveMessage(data) : mockChatRepo.saveMessage(data),
  getMessagesBetween: (userA: string, userB: string) =>
    isDatabaseConnected
      ? postgresChatRepository.getMessagesBetween(userA, userB)
      : mockChatRepo.getMessagesBetween(userA, userB),
  getConversationsFor: (userId: string) =>
    isDatabaseConnected
      ? postgresChatRepository.getConversationsFor(userId)
      : mockChatRepo.getConversationsFor(userId),
  markAsRead: (userA: string, userB: string) =>
    isDatabaseConnected ? postgresChatRepository.markAsRead(userA, userB) : mockChatRepo.markAsRead(userA, userB),
};
