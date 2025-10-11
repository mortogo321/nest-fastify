import type { Event, EventHandler } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

export interface OrderPlacedEventData {
  orderId: string;
  userId: string;
  userEmail: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
  placedAt: Date;
}

@Injectable()
export class OrderPlacedEventHandler implements EventHandler<OrderPlacedEventData> {
  private readonly logger = new Logger(OrderPlacedEventHandler.name);

  async handle(event: Event<OrderPlacedEventData>): Promise<void> {
    this.logger.log(
      `Handling order-placed event for order: ${event.data.orderId} (User: ${event.data.userEmail})`,
    );

    try {
      // Send order confirmation email
      await this.sendOrderConfirmationEmail(event.data);

      // Send order confirmation SMS (optional)
      await this.sendOrderConfirmationSMS(event.data);

      // Additional actions could include:
      // - Sending push notification
      // - Updating inventory
      // - Notifying warehouse
      // - Creating shipping task
      // - Sending to analytics

      this.logger.log(`Order confirmation sent successfully for order ${event.data.orderId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to handle order-placed event: ${errorMessage}`);
      throw error;
    }
  }

  private async sendOrderConfirmationEmail(data: OrderPlacedEventData): Promise<void> {
    await this.sleep(500);

    this.logger.log(`Sending order confirmation email to ${data.userEmail}`);

    // In a real implementation:
    // 1. Use email template for order confirmation
    // 2. Include order details, items, tracking info
    // 3. Add order summary with formatted prices
    // 4. Include customer support contact info

    const itemsList = data.items
      .map((item) => `- ${item.name} x${item.quantity}: ${item.currency}${item.price.toFixed(2)}`)
      .join('\n');

    const emailContent = {
      to: data.userEmail,
      subject: `Order Confirmation - Order #${data.orderId}`,
      body: `
        Thank you for your order!

        Order ID: ${data.orderId}
        Order Date: ${data.placedAt.toISOString()}

        Items:
        ${itemsList}

        Total Amount: ${data.currency}${data.totalAmount.toFixed(2)}

        We'll send you another email when your order ships.

        Thank you for shopping with us!
      `,
      metadata: {
        eventType: 'order-placed',
        orderId: data.orderId,
        userId: data.userId,
      },
    };

    this.logger.debug(`Order confirmation email prepared: ${JSON.stringify(emailContent)}`);
  }

  private async sendOrderConfirmationSMS(data: OrderPlacedEventData): Promise<void> {
    await this.sleep(300);

    this.logger.log(`Sending order confirmation SMS for order ${data.orderId}`);

    // In a real implementation:
    // 1. Get user's phone number from database
    // 2. Format SMS message (keep it short)
    // 3. Send via SMS service (Twilio, AWS SNS, etc.)

    const smsContent = {
      message: `Your order #${data.orderId} has been placed successfully. Total: ${data.currency}${data.totalAmount.toFixed(2)}. We'll notify you when it ships.`,
      metadata: {
        eventType: 'order-placed',
        orderId: data.orderId,
        userId: data.userId,
      },
    };

    this.logger.debug(`Order confirmation SMS prepared: ${JSON.stringify(smsContent)}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
