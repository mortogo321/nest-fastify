import { beforeEach, describe, expect, it } from 'vitest';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

describe('ApiController', () => {
  let apiController: ApiController;

  beforeEach(() => {
    process.env.APP_NAME = 'API';
    apiController = new ApiController(new ApiService());
  });

  describe('root', () => {
    it('should return a greeting from the API gateway', () => {
      expect(apiController.getHello()).toBe('Hello from API!');
    });

    it('should be defined', () => {
      expect(apiController).toBeDefined();
    });
  });
});
