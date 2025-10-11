import { z } from 'zod';

/**
 * Base environment schema shared across all services
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().min(1),
  APP_URL: z.string().url(),
  PORT: z.coerce.number().min(1000).max(65535),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('1h'),
  JWT_COOKIES: z.string().default('access_token'),

  // RabbitMQ
  RABBITMQ_URI: z.string().url().startsWith('amqp://').optional(),

  // Security
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().positive().default(60000),

  // gRPC
  GRPC_PACKAGE: z.string().optional(),
});

/**
 * Auth service specific environment
 */
export const authEnvSchema = baseEnvSchema.extend({
  AUTH_QUEUE: z.string().min(1),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().positive().default(10),
  AUTH_RATE_LIMIT_WINDOW: z.coerce.number().positive().default(60000),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
});

/**
 * API Gateway specific environment
 */
export const apiEnvSchema = baseEnvSchema.extend({
  API_QUEUE: z.string().min(1),
});

/**
 * Alert service specific environment
 */
export const alertEnvSchema = baseEnvSchema.extend({
  ALERT_QUEUE: z.string().min(1),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

/**
 * Payment service specific environment
 */
export const paymentEnvSchema = baseEnvSchema.extend({
  PAYMENT_QUEUE: z.string().min(1),

  // Payment providers (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

/**
 * Worker service specific environment
 */
export const workerEnvSchema = baseEnvSchema.extend({
  WORKER_QUEUE: z.string().min(1),
});

/**
 * Validate environment variables with Zod
 */
export function validateEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  try {
    const validated = schema.parse(process.env);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `❌ Environment validation failed:\n${missingVars}\n\nPlease check your .env file.`,
      );
    }
    throw error;
  }
}

// Export types for use in application
export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type AlertEnv = z.infer<typeof alertEnvSchema>;
export type PaymentEnv = z.infer<typeof paymentEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;
