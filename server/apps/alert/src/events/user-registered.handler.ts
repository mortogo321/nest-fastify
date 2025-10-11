import type { Event, EventHandler } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

export interface UserRegisteredEventData {
  userId: string;
  email: string;
  username: string;
  registeredAt: Date;
}

@Injectable()
export class UserRegisteredEventHandler implements EventHandler<UserRegisteredEventData> {
  private readonly logger = new Logger(UserRegisteredEventHandler.name);

  async handle(event: Event<UserRegisteredEventData>): Promise<void> {
    this.logger.log(
      `Handling user-registered event for user: ${event.data.email} (ID: ${event.data.userId})`,
    );

    try {
      // Send welcome email
      await this.sendWelcomeEmail(event.data);

      // Additional actions could include:
      // - Sending welcome SMS
      // - Sending push notification
      // - Creating onboarding task
      // - Adding to mailing list
      // - Triggering analytics event

      this.logger.log(`Welcome email sent successfully to ${event.data.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to handle user-registered event: ${errorMessage}`);
      throw error;
    }
  }

  private async sendWelcomeEmail(data: UserRegisteredEventData): Promise<void> {
    // Simulate sending welcome email
    await this.sleep(500);

    this.logger.log(`Sending welcome email to ${data.email}`);

    // In a real implementation:
    // 1. Use a templating engine (Handlebars, Pug, etc.)
    // 2. Load email template
    // 3. Inject user data into template
    // 4. Send via email service (AWS SES, SendGrid, etc.)

    const emailContent = {
      to: data.email,
      subject: 'Welcome to Our Platform!',
      body: `
        Hi ${data.username},

        Welcome to our platform! We're excited to have you here.

        Your account has been successfully created.

        Best regards,
        The Team
      `,
      metadata: {
        eventType: 'user-registered',
        userId: data.userId,
      },
    };

    this.logger.debug(`Email content prepared: ${JSON.stringify(emailContent)}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
