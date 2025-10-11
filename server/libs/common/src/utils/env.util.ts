/**
 * Get environment variable with fallback
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Environment variable value or default
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get required environment variable
 * Throws error if not set
 * @param key - Environment variable key
 * @returns Environment variable value
 * @throws Error if environment variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get environment variable as number
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set or invalid
 * @returns Parsed number value or default
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as boolean
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Boolean value
 */
export function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get environment variable as array (comma-separated)
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Array of strings
 */
export function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;

  return value.split(',').map((v) => v.trim());
}

/**
 * Check if running in production
 */
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = (): boolean => process.env.NODE_ENV === 'test';
