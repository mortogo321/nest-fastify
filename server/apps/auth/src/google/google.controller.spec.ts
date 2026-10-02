import { describe, expect, it } from 'vitest';
import { GoogleController } from './google.controller';

describe('GoogleController', () => {
  it('should report the OAuth service as ready', () => {
    const controller = new GoogleController();
    expect(controller.getHello()).toBe('Google OAuth Service Ready');
  });

  it('should be defined', () => {
    expect(new GoogleController()).toBeDefined();
  });
});
