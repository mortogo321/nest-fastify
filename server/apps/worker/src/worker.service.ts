import { getEnv, JobPriority, type TaskQueueService } from '@app/common';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import type { DataImportData, DataImportProcessor } from './tasks/data-import.processor';
import type { EmailTaskData, EmailTaskProcessor } from './tasks/email-task.processor';
import type {
  ReportGenerationData,
  ReportGenerationProcessor,
} from './tasks/report-generation.processor';

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private readonly taskQueue: TaskQueueService,
    private readonly emailProcessor: EmailTaskProcessor,
    private readonly reportProcessor: ReportGenerationProcessor,
    private readonly importProcessor: DataImportProcessor,
  ) {}

  async onModuleInit() {
    this.registerTasks();
    this.logger.log('Worker Service initialized with all tasks');
  }

  getHello(): string {
    const appName = getEnv('APP_NAME', 'Worker');
    return `Hello from ${appName}!`;
  }

  /**
   * Register all task processors
   */
  private registerTasks() {
    // Email task
    this.taskQueue.registerTask({
      name: 'send-email',
      description: 'Send email to users',
      processor: this.emailProcessor,
      defaultOptions: {
        priority: JobPriority.HIGH,
        attempts: 3,
        removeOnComplete: true,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });

    // Report generation task
    this.taskQueue.registerTask({
      name: 'generate-report',
      description: 'Generate various reports',
      processor: this.reportProcessor,
      defaultOptions: {
        priority: JobPriority.NORMAL,
        attempts: 2,
        removeOnComplete: false, // Keep for history
        backoff: {
          type: 'fixed',
          delay: 10000,
        },
      },
    });

    // Data import task
    this.taskQueue.registerTask({
      name: 'import-data',
      description: 'Import data from external sources',
      processor: this.importProcessor,
      defaultOptions: {
        priority: JobPriority.NORMAL,
        attempts: 1, // Don't retry imports
        removeOnComplete: false,
      },
    });

    this.logger.log('All tasks registered');
  }

  /**
   * Add email job
   */
  async sendEmail(data: EmailTaskData) {
    return this.taskQueue.addJob('send-email', data);
  }

  /**
   * Add report generation job
   */
  async generateReport(data: ReportGenerationData) {
    return this.taskQueue.addJob('generate-report', data);
  }

  /**
   * Add data import job
   */
  async importData(data: DataImportData) {
    return this.taskQueue.addJob('import-data', data);
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    return this.taskQueue.getStats();
  }

  /**
   * Get all jobs
   */
  getAllJobs() {
    return this.taskQueue.getAllJobs();
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string) {
    return this.taskQueue.getJob(jobId);
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string) {
    return this.taskQueue.cancelJob(jobId);
  }
}
