import type { Event, EventHandler } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

export interface PaymentSuccessEventData {
  paymentId: string;
  orderId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  paidAt: Date;
}

@Injectable()
export class PaymentSuccessEventHandler implements EventHandler<PaymentSuccessEventData> {
  private readonly logger = new Logger(PaymentSuccessEventHandler.name);

  async handle(event: Event<PaymentSuccessEventData>): Promise<void> {
    this.logger.log(
      `Handling payment-success event for payment: ${event.data.paymentId} (Order: ${event.data.orderId})`,
    );

    try {
      // Send payment receipt email
      await this.sendPaymentReceiptEmail(event.data);

      // Send payment confirmation push notification
      await this.sendPaymentConfirmationPush(event.data);

      // Additional actions could include:
      // - Generating PDF receipt
      // - Updating accounting system
      // - Triggering fulfillment process
      // - Sending to analytics
      // - Updating loyalty points

      this.logger.log(`Payment receipt sent successfully for payment ${event.data.paymentId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to handle payment-success event: ${errorMessage}`);
      throw error;
    }
  }

  private async sendPaymentReceiptEmail(data: PaymentSuccessEventData): Promise<void> {
    await this.sleep(500);

    this.logger.log(`Sending payment receipt email to ${data.userEmail}`);

    // In a real implementation:
    // 1. Generate PDF receipt
    // 2. Use receipt email template
    // 3. Include payment details and invoice number
    // 4. Attach PDF receipt
    // 5. Include tax information if applicable

    const emailContent = {
      to: data.userEmail,
      subject: `Payment Receipt - Transaction #${data.transactionId}`,
      body: `
        Payment Received Successfully

        Payment ID: ${data.paymentId}
        Order ID: ${data.orderId}
        Transaction ID: ${data.transactionId}

        Amount Paid: ${data.currency}${data.amount.toFixed(2)}
        Payment Method: ${this.formatPaymentMethod(data.paymentMethod)}
        Payment Date: ${data.paidAt.toISOString()}

        Thank you for your payment. Your order is being processed.

        A detailed receipt has been attached to this email.

        If you have any questions, please contact our support team.
      `,
      metadata: {
        eventType: 'payment-success',
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
      },
    };

    this.logger.debug(`Payment receipt email prepared: ${JSON.stringify(emailContent)}`);
  }

  private async sendPaymentConfirmationPush(data: PaymentSuccessEventData): Promise<void> {
    await this.sleep(300);

    this.logger.log(`Sending payment confirmation push notification for payment ${data.paymentId}`);

    // In a real implementation:
    // 1. Get user's device tokens
    // 2. Send push notification via FCM/APNs
    // 3. Include deep link to order details

    const pushContent = {
      title: 'Payment Successful',
      body: `Your payment of ${data.currency}${data.amount.toFixed(2)} has been processed successfully.`,
      data: {
        type: 'payment-success',
        paymentId: data.paymentId,
        orderId: data.orderId,
        deepLink: `/orders/${data.orderId}`,
      },
      metadata: {
        eventType: 'payment-success',
        paymentId: data.paymentId,
        userId: data.userId,
      },
    };

    this.logger.debug(`Payment confirmation push prepared: ${JSON.stringify(pushContent)}`);
  }

  private formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      bank_transfer: 'Bank Transfer',
    };

    return methodMap[method] || method;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
