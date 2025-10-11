export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY = 'retry',
}

export enum JobPriority {
  LOW = 0,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
}

export interface JobOptions {
  priority?: JobPriority;
  delay?: number; // Delay in milliseconds
  attempts?: number; // Number of retry attempts
  timeout?: number; // Timeout in milliseconds
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  progress: number;
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
