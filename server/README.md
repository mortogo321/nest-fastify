<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# NestJS Microservices with Fastify

A production-ready microservices architecture built with NestJS, Fastify, gRPC, and RabbitMQ.

## Tech Stack

- **Framework**: NestJS 10.x
- **HTTP Server**: Fastify (high-performance alternative to Express)
- **Database**: PostgreSQL + Prisma ORM
- **Message Broker**: RabbitMQ
- **gRPC**: Inter-service communication
- **Authentication**: JWT with refresh tokens
- **Package Manager**: pnpm (fast, disk-efficient)
- **Linting/Formatting**: Biome (10-100x faster than ESLint)
- **Monorepo**: NestJS CLI workspaces

## Project Structure

```
server/
├── apps/
│   ├── api/          # API Gateway (port 3000)
│   ├── auth/         # Auth Service (port 3001)
│   ├── alert/        # Alert Service (port 3002)
│   ├── payment/      # Payment Service (port 3003)
│   └── worker/       # Worker Service (port 3004)
├── libs/
│   ├── common/       # Shared utilities, guards, interceptors
│   └── proto/        # gRPC proto definitions
├── prisma/           # Database schema and migrations
└── scripts/          # Docker entrypoint scripts
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 16
- RabbitMQ 3.13

## Getting Started

### 1. Install Dependencies

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Environment Setup

Create environment files:

```bash
# Copy example environment files
cp .env.example .env.dev
cp .env.prisma.example .env.prisma
```

Edit `.env.dev` and `.env.prisma` with your configuration.

### 3. Database Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
pnpm prisma:dev migrate dev

# Generate Prisma Client
pnpm prisma:dev generate
```

### 4. Start Services

#### Development Mode (with hot reload)

```bash
# Start all infrastructure (PostgreSQL, RabbitMQ)
docker-compose up -d postgres rabbitmq

# Start all services
pnpm start:dev

# Or start individual services
pnpm start:dev api
pnpm start:dev auth
pnpm start:dev alert
pnpm start:dev payment
pnpm start:dev worker
```

#### Docker Development

```bash
# Start everything with Docker (from root directory)
docker compose -f docker/compose.dev.yml up
```

#### Production

```bash
# Build and start production services (from root directory)
docker compose -f docker/compose.prod.yml up -d
```

## Available Scripts

### Development

- `pnpm start:dev` - Start all services in development mode
- `pnpm start:dev <service>` - Start specific service
- `pnpm build` - Build all services
- `pnpm build <service>` - Build specific service

### Code Quality

- `pnpm lint` - Run Biome linter
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Biome
- `pnpm format:check` - Check code formatting
- `pnpm check` - Run lint + format (with auto-fix)
- `pnpm ci:check` - CI mode (no auto-fix)
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm validate` - Run typecheck + lint + format

### Database

- `pnpm prisma:dev <command>` - Run Prisma CLI for development
- `pnpm prisma:prod <command>` - Run Prisma CLI for production
- `pnpm prisma:dev migrate dev` - Create and apply migrations
- `pnpm prisma:dev generate` - Generate Prisma Client
- `pnpm prisma:dev studio` - Open Prisma Studio

### Testing

- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Run tests with coverage
- `pnpm test:e2e` - Run e2e tests

## Services Overview

### API Gateway (Port 8000)
- Central entry point for all client requests
- Routes requests to appropriate microservices
- Handles authentication and authorization

### Auth Service (Port 8001)
- User registration and authentication
- JWT token management (access + refresh)
- Session management
- gRPC server for user operations

### Alert Service (Port 8002)
- Notification system
- Email/SMS alerts
- Message queue consumer

### Payment Service (Port 8003)
- Payment processing
- Transaction management
- Integration with payment providers

### Worker Service (Port 9000)
- Background job processing
- Scheduled tasks
- Message queue consumer

## gRPC Services

All services communicate via gRPC:

- **Auth Service**: Port 5001
- **Users Service**: Port 5002
- **Alert Service**: Port 5003
- **Payment Service**: Port 5004
- **Worker Service**: Port 5005


## Communication Patterns

### HTTP/REST
- Client → API Gateway
- External API requests

### gRPC
- Service-to-service communication
- High-performance, type-safe
- Bidirectional streaming support

### RabbitMQ
- Asynchronous messaging
- Event-driven communication
- Background job processing

## Key Features

### Background Task Queue (Worker Service)

Complete background job processing system with priority queues, retry logic, and progress tracking.

**Features:**
- Priority-based job queue (HIGH=10, NORMAL=5, LOW=1)
- Automatic retry with configurable attempts (default: 3)
- Exponential and fixed backoff strategies
- Real-time progress tracking (0-100%)
- Job lifecycle: PENDING → PROCESSING → COMPLETED/FAILED/RETRY
- Job statistics and monitoring dashboard
- Lifecycle hooks: `onCompleted`, `onFailed`

**Built-in Task Processors:**
- **Email Task**: Send emails with progress simulation
- **Report Generation**: Generate sales, user activity, inventory, financial reports
- **Data Import**: Import from CSV, JSON, XML, or external APIs

**API Endpoints:**
```bash
# Job Management
POST   /jobs/email      # Create email job
POST   /jobs/report     # Create report generation job
POST   /jobs/import     # Create data import job
GET    /jobs            # Get all jobs
GET    /jobs/:id        # Get job details
GET    /jobs/stats      # Get queue statistics (pending, processing, completed, failed)
DELETE /jobs/:id        # Cancel a job
```

**Example - Email Job:**
```typescript
// Create job
const job = await workerService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Our Platform',
  body: 'Thank you for joining us!',
  from: 'noreply@example.com',
  metadata: { userId: '123', campaign: 'welcome' }
});

// Monitor job
const status = workerService.getJob(job.id);
console.log(status.progress);  // 0-100
console.log(status.status);    // PENDING, PROCESSING, COMPLETED, etc.
```

**Example - Report Generation:**
```typescript
const job = await workerService.generateReport({
  type: ReportType.SALES,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  filters: { departmentId: '123', includeCharts: true }
});
```

**Creating Custom Task Processor:**
```typescript
@Injectable()
export class CustomTaskProcessor implements TaskProcessor<CustomData> {
  async process(job: Job<CustomData>): Promise<JobResult> {
    // Process job
    return { success: true, data: result };
  }

  async onCompleted(job: Job, result: JobResult): Promise<void> {
    // Handle completion
  }

  async onFailed(job: Job, error: Error): Promise<void> {
    // Handle failure
  }
}

// Register task
taskQueue.registerTask({
  name: 'custom-task',
  processor: customProcessor,
  defaultOptions: {
    priority: JobPriority.NORMAL,
    attempts: 3,
    removeOnComplete: false,
    backoff: { type: 'exponential', delay: 5000 }
  }
});
```

### Event Bus (Alert Service)

Event-driven notification system with pub/sub pattern and priority subscriptions.

**Features:**
- Pub/sub pattern with event prioritization
- Event history (stores last 1000 events)
- Both async and sync event publishing
- Event metadata and source tracking
- Subscription management and monitoring
- Built-in event handlers for common scenarios

**Built-in Event Handlers:**
- **UserRegisteredEventHandler**: Welcome emails on user registration
- **OrderPlacedEventHandler**: Order confirmations, inventory updates
- **PaymentSuccessEventHandler**: Payment receipts, fulfillment triggers

**API Endpoints:**
```bash
# Notifications
POST /notifications/email     # Send email notification
POST /notifications/sms       # Send SMS notification
POST /notifications/push      # Send push notification

# Event Management
GET  /events                  # Get event history (with optional event name filter)
GET  /events/stats            # Get event bus statistics
```

**Example - Publishing Events:**
```typescript
// Publish event (async)
await eventBus.publish('user-registered', {
  userId: '123',
  email: 'user@example.com',
  username: 'john_doe',
  registeredAt: new Date()
}, {
  priority: EventPriority.HIGH,
  source: 'auth-service',
  metadata: { ipAddress: '192.168.1.1' }
});

// Publish event (sync)
eventBus.publishSync('order-placed', orderData);
```

**Example - Subscribing to Events:**
```typescript
@Injectable()
export class MyEventHandler implements EventHandler<MyEventData> {
  async handle(event: Event<MyEventData>): Promise<void> {
    console.log(`Handling event: ${event.name}`);
    console.log(`Data:`, event.data);
    console.log(`Source:`, event.source);
  }
}

// Subscribe
const subscriptionId = eventBus.subscribe(
  'user-registered',
  myHandler,
  EventPriority.HIGH
);

// Unsubscribe later
eventBus.unsubscribe(subscriptionId);
```

**Event History & Stats:**
```typescript
// Get recent events
const events = eventBus.getHistory('user-registered', 50);

// Get all events
const allEvents = eventBus.getHistory();

// Get statistics
const stats = eventBus.getStats();
// {
//   totalEvents: 3,
//   totalSubscriptions: 5,
//   historySize: 45,
//   subscriptionCounts: [...]
// }
```

## Code Quality Tools

### Biome

This project uses [Biome](https://biomejs.dev) for linting and formatting. Biome is 10-100x faster than ESLint and Prettier combined.

```bash
# Format and lint with auto-fix
pnpm check

# Check only (no auto-fix)
pnpm format:check
pnpm lint

# Run in CI mode
pnpm ci:check
```

**Configuration**: See `biome.json`

### TypeScript

Strict TypeScript configuration for type safety.

```bash
# Check types
pnpm typecheck
```

## Docker Support

### Development

```bash
# Start all services (from root directory)
docker compose -f docker/compose.dev.yml up

# Start specific services
docker compose -f docker/compose.dev.yml up postgres rabbitmq

# View logs
docker compose -f docker/compose.dev.yml logs -f
```

### Production

```bash
# Build and start (from root directory)
docker compose -f docker/compose.prod.yml up -d

# Scale services
docker compose -f docker/compose.prod.yml up -d --scale worker=3

# View logs
docker compose -f docker/compose.prod.yml logs -f
```

## Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password

### RabbitMQ
- `RABBITMQ_URI` - RabbitMQ connection string
- `RABBITMQ_USER` - RabbitMQ user
- `RABBITMQ_PASSWORD` - RabbitMQ password

### JWT
- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_EXPIRATION` - Access token expiration (e.g., '1h')
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration (e.g., '7d')
- `JWT_COOKIES` - Cookie name for access token

### Services
- `PORT` - Service port number
- `APP_NAME` - Service name
- `NODE_ENV` - Environment (development/production)

## API Documentation

### Health Check
```bash
GET http://localhost:8000/health
```

### Authentication
```bash
# Sign up
POST http://localhost:8001/auth/signup
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Sign in
POST http://localhost:8001/auth/signin
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Refresh token
POST http://localhost:8001/auth/refresh

# Get profile
GET http://localhost:8001/auth/profile
Authorization: Bearer <access_token>

# Sign out
POST http://localhost:8001/auth/signout
```

## Monitoring & Observability

### Audit Logging
All requests are automatically logged with:
- Request ID (for tracing)
- User information
- Request/response data
- Duration
- Status codes

Logs are stored in PostgreSQL for analysis.

### Health Checks
- HTTP health endpoints on all services
- Docker healthchecks configured
- Database connectivity checks

### RabbitMQ Management UI
Access at `http://localhost:15672`
- Username: `admin`
- Password: `admin`

## Security Features

- JWT authentication with refresh tokens
- Secure HTTP-only cookies
- Password hashing with Argon2
- CORS configuration
- Helmet security headers
- Request rate limiting
- Input validation with class-validator
- Sanitized audit logs (sensitive data redacted)

## Performance Optimizations

- **Fastify**: 2x faster than Express
- **pnpm**: Faster installs, less disk space
- **Biome**: 10-100x faster than ESLint/Prettier
- **gRPC**: High-performance service communication
- **Connection pooling**: Prisma connection management
- **Caching**: Redis-ready architecture

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check PostgreSQL is running (from root directory)
docker compose -f docker/compose.dev.yml ps postgres

# Check logs
docker compose -f docker/compose.dev.yml logs postgres

# Restart database
docker compose -f docker/compose.dev.yml restart postgres
```

### Prisma Issues
```bash
# Reset database (WARNING: deletes all data)
pnpm prisma:dev migrate reset

# Regenerate Prisma Client
pnpm prisma:dev generate
```

### pnpm Issues
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm validate` to ensure code quality
4. Run `pnpm test` to ensure tests pass
5. Commit with descriptive messages
6. Create a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
