import { describe, it, expect, beforeEach } from 'vitest';
import { SearchService } from './search.service.js';
import { MockTweetRepository } from '../repositories/mock-tweet.repository.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';

describe('SearchService', () => {
  let tweetRepo: MockTweetRepository;
  let userRepo: MockUserRepository;
  let service: SearchService;

  beforeEach(() => {
    tweetRepo = new MockTweetRepository();
    userRepo = new MockUserRepository();
    service = new SearchService(tweetRepo, userRepo);
  });

  describe('search', () => {
    it('returns empty results when query is empty or whitespace', async () => {
      const emptyResult = await service.search('');
      expect(emptyResult.tweets).toEqual([]);
      expect(emptyResult.users).toEqual([]);

      const whitespaceResult = await service.search('   ');
      expect(whitespaceResult.tweets).toEqual([]);
      expect(whitespaceResult.users).toEqual([]);
    });

    it('searches tweets content case-insensitively', async () => {
      // Seeded tweet contains 'نسخه ۱۶ نکست‌جی‌اس با کامپایل توربوپک'
      const result = await service.search('توربوپک');
      expect(result.tweets.length).toBeGreaterThan(0);
      expect(result.tweets[0].content).toContain('توربوپک');
      expect(result.tweets[0].author.name).toBeDefined();
      expect(result.tweets[0].author.handle).toBeDefined();
      expect(result.tweets[0].time).toBeDefined();
    });

    it('searches users by name and username case-insensitively', async () => {
      // Demo user: name 'کاربر دمو', username 'demo'
      const byName = await service.search('دمو');
      expect(byName.users.some((u) => u.username === 'demo')).toBe(true);

      const byUsername = await service.search('DEMO');
      expect(byUsername.users.some((u) => u.username === 'demo')).toBe(true);

      const byHandle = await service.search('@demo');
      expect(byHandle.users.some((u) => u.username === 'demo')).toBe(true);
    });

    it('populates isLiked correctly when currentUserId is passed', async () => {
      const tweets = await tweetRepo.findAll();
      const firstTweetId = tweets[0].id;
      await tweetRepo.toggleLike(firstTweetId, 'usr_demo_123');

      const result = await service.search('توربوپک', 'usr_demo_123');
      expect(result.tweets[0].isLiked).toBe(true);

      const unauthResult = await service.search('توربوپک');
      expect(unauthResult.tweets[0].isLiked).toBe(false);
    });
  });

  describe('getHashtagTweets', () => {
    it('returns empty array when tag is empty', async () => {
      const result = await service.getHashtagTweets('');
      expect(result).toEqual([]);

      const hashOnly = await service.getHashtagTweets('###');
      expect(hashOnly).toEqual([]);
    });

    it('finds tweets containing hashtag with or without # prefix', async () => {
      // Seeded tweet contains '#ری‌اکت #توسعه_وب #طراحی_رابط_کاربری'
      const withoutHash = await service.getHashtagTweets('ری‌اکت');
      expect(withoutHash.length).toBeGreaterThan(0);
      expect(withoutHash[0].content).toContain('#ری‌اکت');
      expect(withoutHash[0].author.name).toBeDefined();
      expect(withoutHash[0].time).toBeDefined();

      const withHash = await service.getHashtagTweets('#ری‌اکت');
      expect(withHash.length).toBe(withoutHash.length);
      expect(withHash[0].id).toBe(withoutHash[0].id);

      const multipleHashes = await service.getHashtagTweets('##توسعه_وب');
      expect(multipleHashes.length).toBeGreaterThan(0);
      expect(multipleHashes[0].content).toContain('#توسعه_وب');
    });
  });

  describe('getTrendingHashtags', () => {
    it('extracts all hashtags from tweets and aggregates count descending', async () => {
      // Add another tweet with '#ری‌اکت' to make it have higher count
      await tweetRepo.create({
        authorId: 'usr_demo_123',
        content: 'پست جدید درباره #ری‌اکت و فریم‌ورک‌های مدرن',
      });

      const trending = await service.getTrendingHashtags();
      expect(trending.length).toBeGreaterThanOrEqual(3);

      // '#ری‌اکت' was in tweet_2 and in the newly created tweet -> count should be 2
      const reactTag = trending.find((t) => t.tag === 'ری‌اکت');
      expect(reactTag).toBeDefined();
      expect(reactTag?.count).toBe(2);

      // Verify sorted by count descending
      for (let i = 0; i < trending.length - 1; i++) {
        expect(trending[i].count).toBeGreaterThanOrEqual(trending[i + 1].count);
      }
    });

    it('handles tweets without hashtags without error', async () => {
      const emptyRepo = new MockTweetRepository();
      // Clear out tweets
      (emptyRepo as any).tweets = [
        {
          id: 'tweet_nohash',
          authorId: 'usr_demo_123',
          content: 'این یک متن ساده بدون هیچ برچسبی است.',
          likesCount: 0,
          commentsCount: 0,
          repostsCount: 0,
          views: '1',
          createdAt: new Date().toISOString(),
        },
      ];

      const customService = new SearchService(emptyRepo, userRepo);
      const trending = await customService.getTrendingHashtags();
      expect(trending).toEqual([]);
    });
  });
});
