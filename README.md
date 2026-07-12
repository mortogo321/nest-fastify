# NestJS Microservices with Fastify

A production-ready microservices architecture built with NestJS, Fastify, gRPC, and RabbitMQ.

## Tech Stack
- **Framework**: NestJS 11
- **HTTP Server**: Fastify
- **Database**: PostgreSQL 16 + Prisma ORM
- **Message Broker**: RabbitMQ 3.13
- **gRPC**: Inter-service communication
- **Authentication**: JWT with refresh tokens
- **Package Manager**: pnpm
- **Linting/Formatting**: Biome

## Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/mortogo321/nest-fastify.git
cd nest-fastify
```

### 2. Install Dependencies
```bash
# Install pnpm globally
npm install -g pnpm

# Install NestJS CLI and dotenvx
pnpm add -g @nestjs/cli @dotenvx/dotenvx

# Install project dependencies
cd server
pnpm install
```

### 3. Environment Setup
```bash
# Copy environment files
cp .env.example .env.dev
cp .env.prisma.example .env.prisma

# Edit configuration files as needed
```

### 4. Start with Docker (Recommended)
```bash
# Start all services
docker compose -f docker/compose.dev.yml up -d

# View logs
docker compose -f docker/compose.dev.yml logs -f
```

### 5. Local Development
```bash
# Start infrastructure
docker compose -f docker/compose.dev.yml up -d postgres rabbitmq

# Run database migrations
cd server
pnpm prisma:dev migrate dev

# Start all services
pnpm start:dev

# Or start specific service
pnpm start:dev auth
```

## Services

| Service | HTTP Port | gRPC Port | Description |
|---------|-----------|-----------|-------------|
| API Gateway | 8000 | - | Main entry point |
| Auth Service | 8001 | 5001 | Authentication & users |
| Alert Service | 8002 | 5003 | Notifications |
| Payment Service | 8003 | 5004 | Payment processing |
| Worker Service | 9000 | 5005 | Background jobs |

## Available Scripts

```bash
# Development
pnpm start:dev              # Start all services
pnpm start:dev <service>    # Start specific service
pnpm build                  # Build all services

# Code Quality
pnpm lint                   # Run Biome linter
pnpm format                 # Format code
pnpm check                  # Lint + format (auto-fix)
pnpm typecheck             # TypeScript type checking
pnpm validate              # Full validation

# Database (Prisma)
pnpm prisma:dev generate           # Generate Prisma Client
pnpm prisma:dev migrate dev        # Create and apply migrations
pnpm prisma:dev studio             # Open Prisma Studio

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e              # Run e2e tests
pnpm test:cov              # Run with coverage
```

## Docker Commands

### Development
```bash
# Start all services
docker compose -f docker/compose.dev.yml up -d

# Stop services
docker compose -f docker/compose.dev.yml down

# View logs
docker compose -f docker/compose.dev.yml logs -f

# Rebuild
docker compose -f docker/compose.dev.yml up -d --build
```

### Production
```bash
# Start production services
docker compose -f docker/compose.prod.yml up -d

# Scale workers
docker compose -f docker/compose.prod.yml up -d --scale worker=3

# View logs
docker compose -f docker/compose.prod.yml logs -f
```

## Management Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| Prisma Studio | Run `pnpm prisma:dev studio` | - |

## API Documentation

Swagger documentation available for each service:
- API Gateway: http://localhost:8000/docs
- Auth Service: http://localhost:8001/docs
- Alert Service: http://localhost:8002/docs
- Payment Service: http://localhost:8003/docs
- Worker Service: http://localhost:9000/docs

## Project Structure

```
nest-fastify/
├── server/              # Main application
│   ├── apps/           # Microservices
│   │   ├── api/        # API Gateway
│   │   ├── auth/       # Auth Service
│   │   ├── alert/      # Alert Service
│   │   ├── payment/    # Payment Service
│   │   └── worker/     # Worker Service
│   ├── libs/           # Shared libraries
│   │   ├── common/     # Common utilities
│   │   └── proto/      # gRPC definitions
│   ├── prisma/         # Database schema
│   └── scripts/        # Helper scripts
└── docker/             # Docker configuration
    ├── compose.dev.yml     # Development compose
    └── compose.prod.yml    # Production compose
```

## Environment Variables

### Global Environment
- `.env.dev` - Development environment
- `.env.prod` - Production environment
- `.env.prisma` - Prisma configuration

### Key Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# RabbitMQ
RABBITMQ_URI=amqp://admin:admin@localhost:5672

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Service Config
NODE_ENV=development
PORT=8000
APP_NAME="Service Name"
```

## Communication Patterns

### HTTP/REST
- Client → API Gateway
- External API requests

### gRPC
- Service-to-service communication
- High-performance, type-safe
- Bidirectional streaming

### RabbitMQ
- Asynchronous messaging
- Event-driven architecture
- Background job processing

## Features

### Background Task Queue (Worker Service)

The Worker service provides a complete background job processing system with:

**Features:**
- Priority-based job queue (HIGH=10, NORMAL=5, LOW=1)
- Automatic retry with configurable attempts
- Exponential and fixed backoff strategies
- Progress tracking (0-100%)
- Job lifecycle management (PENDING → PROCESSING → COMPLETED/FAILED/RETRY)
- Job statistics and monitoring

**Built-in Task Processors:**
- **Email Task**: Send emails with progress tracking
- **Report Generation**: Generate sales, user activity, inventory, and financial reports
- **Data Import**: Import data from CSV, JSON, XML, or API sources

**API Endpoints:**
```bash
POST   /jobs/email      # Create email job
POST   /jobs/report     # Create report generation job
POST   /jobs/import     # Create data import job
GET    /jobs            # Get all jobs
GET    /jobs/:id        # Get job details
GET    /jobs/stats      # Get queue statistics
DELETE /jobs/:id        # Cancel a job
```

**Example Usage:**
```typescript
// Create an email job
const job = await workerService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Thanks for joining!',
  metadata: { userId: '123' }
});

// Check job status
const status = await workerService.getJob(job.id);
console.log(status.progress); // 0-100
```

### Event Bus (Alert Service)

The Alert service provides an event-driven notification system with:

**Features:**
- Pub/sub pattern with priority subscriptions
- Event history tracking (stores last 1000 events)
- Both async and sync event publishing
- Event metadata and source tracking
- Statistics and monitoring

**Built-in Event Handlers:**
- **UserRegisteredEventHandler**: Send welcome emails on user registration
- **OrderPlacedEventHandler**: Send order confirmations, update inventory
- **PaymentSuccessEventHandler**: Send payment receipts, trigger fulfillment

**API Endpoints:**
```bash
POST /notifications/email     # Send email notification
POST /notifications/sms       # Send SMS notification
POST /notifications/push      # Send push notification
GET  /events                  # Get event history
GET  /events/stats            # Get event bus statistics
```

**Example Usage:**
```typescript
// Publish an event
await eventBus.publish('user-registered', {
  userId: '123',
  email: 'user@example.com',
  username: 'john_doe',
  registeredAt: new Date()
}, {
  priority: EventPriority.HIGH,
  source: 'auth-service'
});

// Subscribe to events
eventBus.subscribe('user-registered', myHandler, EventPriority.HIGH);
```

## Security Features
- JWT authentication with refresh tokens
- Secure HTTP-only cookies
- Password hashing with Argon2
- CORS configuration
- Helmet security headers
- Input validation
- Sanitized audit logs

## Troubleshooting

### Port Already in Use
```bash
lsof -i :8000
kill -9 <PID>
```

### Database Issues
```bash
# Reset database (WARNING: deletes data)
pnpm prisma:dev migrate reset

# Regenerate client
pnpm prisma:dev generate
```

### Docker Issues
```bash
# Clean up containers
docker compose -f docker/compose.dev.yml down -v

# Remove all
docker compose -f docker/compose.dev.yml down --rmi all --remove-orphans
```

## Documentation

For detailed documentation, see:
- `server/README.md` - Comprehensive project documentation

## Contributing

1. Create a feature branch
2. Make changes
3. Run `pnpm validate` to ensure code quality
4. Run `pnpm test` to ensure tests pass
5. Create a pull request

## License

MIT License

---

For detailed setup and development guide, see [server/README.md](./server/README.md)
