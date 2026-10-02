import { beforeEach, describe, expect, it } from 'vitest';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let paymentController: PaymentController;

  beforeEach(() => {
    process.env.APP_NAME = 'Payment';
    paymentController = new PaymentController(new PaymentService());
  });

  describe('root', () => {
    it('should return a greeting from the payment service', () => {
      expect(paymentController.getHello()).toBe('Hello from Payment!');
    });

    it('should be defined', () => {
      expect(paymentController).toBeDefined();
    });
  });
});
