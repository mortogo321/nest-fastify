import { afterEach, describe, expect, it } from 'vitest';
import { getJwtExpiresIn } from './env.util';

describe('getJwtExpiresIn', () => {
  const key = 'JWT_EXPIRATION';
  const previous = process.env[key];

  afterEach(() => {
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  });

  it('should return duration strings as-is', () => {
    process.env[key] = '7d';
    expect(getJwtExpiresIn()).toBe('7d');
  });

  it('should return numeric strings as numbers', () => {
    process.env[key] = '3600';
    expect(getJwtExpiresIn()).toBe(3600);
  });

  it('should fall back to the default when the variable is missing', () => {
    delete process.env[key];
    expect(getJwtExpiresIn(key, '1h')).toBe('1h');
  });

  it('should throw when the variable is missing and no default is given', () => {
    delete process.env[key];
    expect(() => getJwtExpiresIn()).toThrow(`Required environment variable ${key} is not set`);
  });
});
