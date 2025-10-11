import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'apiVersion';

/**
 * Decorator to specify API version for a controller or route
 * @param version - API version (e.g., '1', '2')
 */
export const ApiVersion = (version: string | string[]) =>
  SetMetadata(API_VERSION_KEY, Array.isArray(version) ? version : [version]);
