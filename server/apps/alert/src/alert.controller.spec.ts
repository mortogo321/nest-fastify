import type { EventBusService } from '@app/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

describe('AlertController', () => {
  let alertController: AlertController;

  beforeEach(() => {
    process.env.APP_NAME = 'Alert';
    const eventBus = {} as EventBusService;
    alertController = new AlertController(new AlertService(eventBus));
  });

  describe('root', () => {
    it('should return a greeting from the alert service', () => {
      expect(alertController.getHello()).toBe('Hello from Alert!');
    });

    it('should be defined', () => {
      expect(alertController).toBeDefined();
    });
  });
});
