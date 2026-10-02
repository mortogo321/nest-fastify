import type { TaskQueueService } from '@app/common';
import { beforeEach, describe, expect, it } from 'vitest';
import type { DataImportProcessor } from './tasks/data-import.processor';
import type { EmailTaskProcessor } from './tasks/email-task.processor';
import type { ReportGenerationProcessor } from './tasks/report-generation.processor';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

describe('WorkerController', () => {
  let workerController: WorkerController;

  beforeEach(() => {
    process.env.APP_NAME = 'Worker';
    const workerService = new WorkerService(
      {} as TaskQueueService,
      {} as EmailTaskProcessor,
      {} as ReportGenerationProcessor,
      {} as DataImportProcessor,
    );
    workerController = new WorkerController(workerService);
  });

  describe('root', () => {
    it('should return a greeting from the worker service', () => {
      expect(workerController.getHello()).toBe('Hello from Worker!');
    });

    it('should be defined', () => {
      expect(workerController).toBeDefined();
    });
  });
});
