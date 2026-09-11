import { describe, it, expect } from 'vitest';
import { HandleError } from './handle-error.js';

describe('HandleError', () => {
  it('should create an operational error with proper status code and message', () => {
    const error = new HandleError('خطای تست', 400);
    expect(error.message).toBe('خطای تست');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('should create notFound error with 404', () => {
    const error = HandleError.notFound('پست یافت نشد');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('پست یافت نشد');
  });

  it('should create unauthorized error with 401', () => {
    const error = HandleError.unauthorized();
    expect(error.statusCode).toBe(401);
  });
});
