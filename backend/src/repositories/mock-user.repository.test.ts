import { describe, it, expect } from 'vitest';
import { MockUserRepository } from './mock-user.repository.js';

describe('MockUserRepository', () => {
  it('should find seeded demo user by email or username', async () => {
    const repo = new MockUserRepository();
    const byEmail = await repo.findByEmailOrUsername('demo@example.com');
    const byUsername = await repo.findByEmailOrUsername('demo');
    
    expect(byEmail).toBeDefined();
    expect(byUsername).toBeDefined();
    expect(byEmail?.id).toBe(byUsername?.id);
    expect(byEmail?.name).toBe('کاربر دمو');
  });

  it('should create and store a new user', async () => {
    const repo = new MockUserRepository();
    const newUser = await repo.create({
      name: 'تست',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    expect(newUser.id).toBeDefined();
    const found = await repo.findById(newUser.id);
    expect(found?.username).toBe('testuser');
  });
});
