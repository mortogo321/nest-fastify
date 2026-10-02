import { describe, expect, it } from 'vitest';
import { FacebookController } from './facebook.controller';

describe('FacebookController', () => {
  it('should report the OAuth service as ready', () => {
    const controller = new FacebookController();
    expect(controller.getHello()).toBe('Facebook OAuth Service Ready');
  });

  it('should be defined', () => {
    expect(new FacebookController()).toBeDefined();
  });
});
