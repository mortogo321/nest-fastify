import { randomUUID } from 'node:crypto';
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { Job, JobOptions } from './interfaces/job.interface';
import { JobPriority, JobStatus } from './interfaces/job.interface';
import type { TaskDefinition } from './interfaces/task.interface';

@Injectable()
export class TaskQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TaskQueueService.name);
  private readonly tasks = new Map<string, TaskDefinition>();
  private readonly jobs = new Map<string, Job>();
  private readonly processingJobs = new Set<string>();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;

  async onModuleInit() {
    this.logger.log('Task Queue Service initialized');
    this.startProcessing();
  }

  async onModuleDestroy() {
    this.stopProcessing();
    this.logger.log('Task Queue Service destroyed');
  }

  /**
   * Register a task processor
   */
  registerTask(definition: TaskDefinition): void {
    if (this.tasks.has(definition.name)) {
      throw new Error(`Task ${definition.name} is already registered`);
    }

    this.tasks.set(definition.name, definition);
    this.logger.log(`Registered task: ${definition.name}`);
  }

  /**
   * Add a job to the queue
   */
  async addJob<T = any>(taskName: string, data: T, options: JobOptions = {}): Promise<Job<T>> {
    const task = this.tasks.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    const job: Job<T> = {
      id: randomUUID(),
      name: taskName,
      data,
      status: JobStatus.PENDING,
      priority: options.priority ?? task.defaultOptions?.priority ?? JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: options.attempts ?? task.defaultOptions?.attempts ?? 3,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Handle delay
    if (options.delay) {
      setTimeout(() => {
        this.jobs.set(job.id, job);
        this.logger.log(`Job ${job.id} (${job.name}) added to queue after delay`);
      }, options.delay);
    } else {
      this.jobs.set(job.id, job);
      this.logger.log(`Job ${job.id} (${job.name}) added to queue`);
    }

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Get jobs by task name
   */
  getJobsByTask(taskName: string): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.name === taskName);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === JobStatus.PROCESSING) {
      this.logger.warn(`Cannot cancel job ${jobId} - currently processing`);
      return false;
    }

    job.status = JobStatus.CANCELLED;
    job.updatedAt = new Date();
    this.logger.log(`Job ${jobId} cancelled`);
    return true;
  }

  /**
   * Remove a job from queue
   */
  removeJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === JobStatus.PROCESSING) {
      this.logger.warn(`Cannot remove job ${jobId} - currently processing`);
      return false;
    }

    this.jobs.delete(jobId);
    this.logger.log(`Job ${jobId} removed from queue`);
    return true;
  }

  /**
   * Update job progress
   */
  updateProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress));
      job.updatedAt = new Date();
    }
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processNextJob();
    }, 1000); // Check every second

    this.logger.log('Started job processing');
  }

  /**
   * Stop processing jobs
   */
  private stopProcessing(): void {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
    this.logger.log('Stopped job processing');
  }

  /**
   * Process next job in queue
   */
  private async processNextJob(): Promise<void> {
    // Get pending jobs sorted by priority
    const pendingJobs = Array.from(this.jobs.values())
      .filter((job) => job.status === JobStatus.PENDING)
      .sort((a, b) => b.priority - a.priority);

    if (pendingJobs.length === 0) {
      return;
    }

    const job = pendingJobs[0];
    if (!job || this.processingJobs.has(job.id)) {
      return;
    }

    // Mark as processing
    this.processingJobs.add(job.id);
    job.status = JobStatus.PROCESSING;
    job.startedAt = new Date();
    job.updatedAt = new Date();
    job.attempts++;

    const task = this.tasks.get(job.name);
    if (!task) {
      this.logger.error(`Task ${job.name} not found for job ${job.id}`);
      this.processingJobs.delete(job.id);
      return;
    }

    try {
      // Process the job
      const result = await task.processor.process(job);

      if (result.success) {
        job.status = JobStatus.COMPLETED;
        job.result = result.data;
        job.completedAt = new Date();
        this.logger.log(`Job ${job.id} (${job.name}) completed successfully`);

        // Call completion handler
        if (task.processor.onCompleted) {
          await task.processor.onCompleted(job, result);
        }

        // Remove job if configured
        if (task.defaultOptions?.removeOnComplete) {
          this.jobs.delete(job.id);
        }
      } else {
        throw new Error(result.error || 'Job failed without error message');
      }
    } catch (error) {
      this.handleJobError(job, task, error);
    } finally {
      job.updatedAt = new Date();
      this.processingJobs.delete(job.id);
    }
  }

  /**
   * Handle job processing errors
   */
  private async handleJobError(job: Job, task: TaskDefinition, error: unknown): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${errorMessage}`);

    job.error = errorMessage;

    // Retry logic
    if (job.attempts < job.maxAttempts) {
      job.status = JobStatus.RETRY;
      this.logger.log(`Job ${job.id} will be retried (${job.attempts}/${job.maxAttempts})`);

      // Apply backoff
      const backoff = task.defaultOptions?.backoff;
      if (backoff) {
        const delay =
          backoff.type === 'exponential' ? backoff.delay * 2 ** (job.attempts - 1) : backoff.delay;

        setTimeout(() => {
          job.status = JobStatus.PENDING;
          job.updatedAt = new Date();
        }, delay);
      } else {
        job.status = JobStatus.PENDING;
      }
    } else {
      job.status = JobStatus.FAILED;
      job.failedAt = new Date();
      this.logger.error(`Job ${job.id} failed permanently after ${job.attempts} attempts`);

      // Call failure handler
      if (task.processor.onFailed) {
        await task.processor.onFailed(job, error as Error);
      }

      // Remove job if configured
      if (task.defaultOptions?.removeOnFail) {
        this.jobs.delete(job.id);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === JobStatus.PENDING).length,
      processing: jobs.filter((j) => j.status === JobStatus.PROCESSING).length,
      completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
      failed: jobs.filter((j) => j.status === JobStatus.FAILED).length,
      cancelled: jobs.filter((j) => j.status === JobStatus.CANCELLED).length,
      retry: jobs.filter((j) => j.status === JobStatus.RETRY).length,
      tasks: this.tasks.size,
    };
  }
}
