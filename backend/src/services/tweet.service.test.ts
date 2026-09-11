import { describe, it, expect, beforeEach } from 'vitest';
import { TweetService } from './tweet.service.js';
import { MockTweetRepository } from '../repositories/mock-tweet.repository.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';
import { HandleError } from '../errors/handle-error.js';

describe('TweetService', () => {
  let tweetRepo: MockTweetRepository;
  let userRepo: MockUserRepository;
  let service: TweetService;

  beforeEach(() => {
    tweetRepo = new MockTweetRepository();
    userRepo = new MockUserRepository();
    service = new TweetService(tweetRepo, userRepo);
  });

  it('should return populated feed', async () => {
    const feed = await service.getFeed();
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0].author.name).toBeDefined();
    expect(feed[0].time).toBeDefined();
  });

  it('should create tweet and return populated data', async () => {
    const tweet = await service.createTweet('usr_demo_123', {
      content: 'متن جدید برای تست',
    });
    expect(tweet.content).toBe('متن جدید برای تست');
    expect(tweet.author.handle).toBe('@demo');
  });

  it('should throw HandleError if liking non-existent tweet', async () => {
    await expect(service.toggleLike('non_existent', 'usr_demo_123')).rejects.toThrow(
      HandleError
    );
  });

  it('should toggle like successfully', async () => {
    const feed = await service.getFeed();
    const result = await service.toggleLike(feed[0].id, 'usr_demo_123');
    expect(result.liked).toBe(true);
  });

  it('should add comment and return populated data', async () => {
    const feed = await service.getFeed();
    const comment = await service.addComment(feed[0].id, 'usr_demo_123', {
      content: 'پاسخ تستی',
    });
    expect(comment.content).toBe('پاسخ تستی');
    expect(comment.author.name).toBeDefined();
  });
});
