import type { Job, JobOptions, JobResult } from './job.interface';

/**
 * Interface for task processors
 */
export interface TaskProcessor<T = any, R = any> {
  /**
   * Process a job
   * @param job - The job to process
   * @returns Result of the job processing
   */
  process(job: Job<T>): Promise<JobResult<R>>;

  /**
   * Handle job completion
   */
  onCompleted?(job: Job<T>, result: JobResult<R>): Promise<void>;

  /**
   * Handle job failure
   */
  onFailed?(job: Job<T>, error: Error): Promise<void>;

  /**
   * Handle job progress
   */
  onProgress?(job: Job<T>, progress: number): Promise<void>;
}

/**
 * Task definition
 */
export interface TaskDefinition {
  name: string;
  description?: string;
  processor: TaskProcessor;
  defaultOptions?: JobOptions;
}
