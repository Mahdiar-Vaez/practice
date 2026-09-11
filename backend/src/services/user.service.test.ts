import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './user.service.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';
import { MockTweetRepository } from '../repositories/mock-tweet.repository.js';
import { HandleError } from '../errors/handle-error.js';

describe('UserService', () => {
  let userRepo: MockUserRepository;
  let tweetRepo: MockTweetRepository;
  let service: UserService;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    tweetRepo = new MockTweetRepository();
    service = new UserService(userRepo, tweetRepo);
  });

  it('should get profile without password', async () => {
    const profile = await service.getProfile('usr_demo_123');
    expect(profile.id).toBe('usr_demo_123');
    expect((profile as any).password).toBeUndefined();
  });

  it('should throw HandleError when profile not found', async () => {
    await expect(service.getProfile('non_existent')).rejects.toThrow(HandleError);
  });

  it('should update profile name and bio', async () => {
    const updated = await service.updateProfile('usr_demo_123', {
      name: 'نام جدید تست',
      bio: 'بیوگرافی جدید',
    });
    expect(updated.name).toBe('نام جدید تست');
    expect(updated.bio).toBe('بیوگرافی جدید');
  });

  it('should get user tweets', async () => {
    const tweets = await service.getUserTweets('usr_demo_123');
    expect(tweets.length).toBeGreaterThan(0);
    expect(tweets[0].author.name).toBeDefined();
  });

  it('should delete account and cascade user data', async () => {
    const result = await service.deleteAccount('usr_demo_123');
    expect(result.success).toBe(true);
    await expect(service.getProfile('usr_demo_123')).rejects.toThrow(HandleError);
  });
});
