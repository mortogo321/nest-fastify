import type { Job, JobResult, TaskProcessor } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

export interface DataImportData {
  fileUrl: string;
  type: 'users' | 'products' | 'orders';
  userId: string;
}

@Injectable()
export class DataImportProcessor implements TaskProcessor<DataImportData> {
  private readonly logger = new Logger(DataImportProcessor.name);

  async process(job: Job<DataImportData>): Promise<JobResult> {
    this.logger.log(`Starting data import job ${job.id} for ${job.data.type}`);

    try {
      // Simulate long-running data import with progress
      const totalRecords = Math.floor(Math.random() * 10000) + 1000;
      const batchSize = 100;
      let processed = 0;

      this.logger.log(`Importing ${totalRecords} records from ${job.data.fileUrl}`);

      while (processed < totalRecords) {
        // Simulate processing a batch
        await this.sleep(500);
        processed += batchSize;

        const progress = Math.min((processed / totalRecords) * 100, 100);
        this.logger.log(`Import progress: ${progress.toFixed(2)}% (${processed}/${totalRecords})`);

        // In a real implementation:
        // 1. Download file from URL
        // 2. Parse CSV/Excel/JSON
        // 3. Validate data
        // 4. Insert into database in batches
        // 5. Handle duplicates/conflicts
        // 6. Update progress
      }

      const stats = {
        totalRecords,
        imported: totalRecords,
        failed: 0,
        duplicates: Math.floor(Math.random() * 10),
      };

      this.logger.log(`Data import completed: ${JSON.stringify(stats)}`);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Data import failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async onCompleted(job: Job<DataImportData>, result: JobResult): Promise<void> {
    this.logger.log(`Data import job ${job.id} completed`);
    // Send notification to user with import results
  }

  async onFailed(job: Job<DataImportData>, error: Error): Promise<void> {
    this.logger.error(`Data import job ${job.id} failed permanently: ${error.message}`);
    // Notify user about the failure
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
