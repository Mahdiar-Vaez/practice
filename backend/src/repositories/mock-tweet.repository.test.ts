import { describe, it, expect, beforeEach } from 'vitest';
import { MockTweetRepository } from './mock-tweet.repository.js';

describe('MockTweetRepository', () => {
  let repo: MockTweetRepository;

  beforeEach(() => {
    repo = new MockTweetRepository();
  });

  it('should return seeded tweets', async () => {
    const tweets = await repo.findAll();
    expect(tweets.length).toBeGreaterThanOrEqual(3);
  });

  it('should create a new tweet', async () => {
    const tweet = await repo.create({
      authorId: 'usr_demo_123',
      content: 'پست جدید تستی',
    });

    expect(tweet.id).toBeDefined();
    expect(tweet.content).toBe('پست جدید تستی');
  });

  it('should toggle like and update likesCount', async () => {
    const tweets = await repo.findAll();
    const tweetId = tweets[0].id;
    const initialLikes = tweets[0].likesCount;

    const likeResult = await repo.toggleLike(tweetId, 'usr_demo_123');
    expect(likeResult.liked).toBe(true);
    expect(likeResult.count).toBe(initialLikes + 1);

    const unlikeResult = await repo.toggleLike(tweetId, 'usr_demo_123');
    expect(unlikeResult.liked).toBe(false);
    expect(unlikeResult.count).toBe(initialLikes);
  });

  it('should add comment and update commentsCount', async () => {
    const tweets = await repo.findAll();
    const tweetId = tweets[0].id;
    const initialComments = tweets[0].commentsCount;

    const comment = await repo.addComment(tweetId, {
      authorId: 'usr_demo_123',
      content: 'نظر تستی',
    });

    expect(comment.id).toBeDefined();
    const comments = await repo.getComments(tweetId);
    expect(comments.some(c => c.id === comment.id)).toBe(true);

    const updatedTweet = await repo.findById(tweetId);
    expect(updatedTweet?.commentsCount).toBe(initialComments + 1);
  });
});
