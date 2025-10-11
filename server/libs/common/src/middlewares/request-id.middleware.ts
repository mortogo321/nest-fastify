import { Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Request ID Middleware
 * Assigns a unique ID to each request for tracking and debugging
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    // Check if request already has an ID (from client or load balancer)
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // Attach to request object
    (req as any).id = requestId;

    // Add to response headers
    res.header('X-Request-ID', requestId);

    next();
  }
}
