import type { Job, JobResult, TaskProcessor } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

export interface EmailTaskData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

@Injectable()
export class EmailTaskProcessor implements TaskProcessor<EmailTaskData> {
  private readonly logger = new Logger(EmailTaskProcessor.name);

  async process(job: Job<EmailTaskData>): Promise<JobResult> {
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);

    try {
      // Simulate email sending with progress updates
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        await this.sleep(1000); // Simulate work
        const progress = (i / steps) * 100;
        this.logger.log(`Email job ${job.id} progress: ${progress}%`);
      }

      // In a real implementation, you would integrate with an email service like:
      // - AWS SES
      // - SendGrid
      // - Mailgun
      // - Nodemailer

      this.logger.log(`Email sent successfully to ${job.data.to}`);

      return {
        success: true,
        data: {
          messageId: `msg-${Date.now()}`,
          sentAt: new Date(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async onCompleted(job: Job<EmailTaskData>): Promise<void> {
    this.logger.log(`Email job ${job.id} completed successfully`);
  }

  async onFailed(job: Job<EmailTaskData>, error: Error): Promise<void> {
    this.logger.error(`Email job ${job.id} failed permanently: ${error.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
