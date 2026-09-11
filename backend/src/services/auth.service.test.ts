import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';

describe('AuthService', () => {
  let service: AuthService;
  let repo: MockUserRepository;

  beforeEach(() => {
    repo = new MockUserRepository();
    service = new AuthService(repo);
  });

  it('should authenticate demo user with correct credentials', async () => {
    const result = await service.login({
      identifier: 'demo@example.com',
      password: 'password123',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('demo@example.com');
    expect(result.user.name).toBe('کاربر دمو');
  });

  it('should throw error for invalid password', async () => {
    await expect(
      service.login({
        identifier: 'demo@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('اطلاعات ورود نامعتبر است');
  });

  it('should throw error for non-existent user', async () => {
    await expect(
      service.login({
        identifier: 'unknown@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('اطلاعات ورود نامعتبر است');
  });
});
