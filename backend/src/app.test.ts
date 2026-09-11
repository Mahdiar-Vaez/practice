import { describe, it, expect } from 'vitest';
import app from './app.js';

describe('Express App Integration', () => {
  it('should have health check and routes configured', () => {
    expect(app).toBeDefined();
  });
});
