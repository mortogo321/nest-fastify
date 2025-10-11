import {
  AuditLogInterceptor,
  AuditService,
  GrpcService,
  getEnv,
  getEnvNumber,
  getRequiredEnv,
  HttpExceptionFilter,
  isDevelopment,
  ResponseInterceptor,
  RmqService,
  UnauthorizedExceptionFilter,
} from '@app/common';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { GrpcOptions, RmqOptions } from '@nestjs/microservices';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const appName = getEnv('APP_NAME', 'Auth');
  const appUrl = getEnv('APP_URL', 'http://localhost:3001');
  const app = await NestFactory.create<NestFastifyApplication>(AuthModule, new FastifyAdapter());

  // Security: CORS configuration
  await app.register(fastifyCors, {
    origin: getEnv('CORS_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Security: Helmet for HTTP headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: !isDevelopment(),
    crossOriginEmbedderPolicy: false,
  });

  // Security: Stricter rate limiting for auth endpoints (prevent brute force)
  await app.register(fastifyRateLimit, {
    max: getEnvNumber('AUTH_RATE_LIMIT_MAX', 10),
    timeWindow: getEnvNumber('AUTH_RATE_LIMIT_WINDOW', 60000),
    errorResponseBuilder: (_, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Too many authentication attempts, retry in ${context.after}`,
    }),
  });

  // Cookie handling
  await app.register(fastifyCookie, {
    secret: getRequiredEnv('JWT_SECRET'),
  });

  // API Versioning - URI-based (e.g., /v1/auth, /v2/auth)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Enable global prefix for authentication routes
  app.setGlobalPrefix('auth', {
    exclude: ['/', 'health'], // Exclude health check and root
  });

  // Swagger documentation (only in non-production)
  if (isDevelopment()) {
    const documentConfig = new DocumentBuilder()
      .setTitle(`${appName} Service`)
      .setDescription(`${appName} Service API description`)
      .setVersion('1.0')
      .addTag(appName)
      .addServer(appUrl)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, documentConfig);

    SwaggerModule.setup('docs', app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      disableErrorMessages: !isDevelopment(),
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  const auditService = app.get(AuditService, { strict: false });
  app.useGlobalInterceptors(new AuditLogInterceptor(auditService));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // RabbitMQ
  const queueName = getRequiredEnv('AUTH_QUEUE');
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions(queueName, true));

  // gRPC - Auth Service
  const grpcService = app.get<GrpcService>(GrpcService);
  app.connectMicroservice<GrpcOptions>(
    grpcService.getOptions({
      packageName: 'nest.app',
      name: 'auth',
    }),
  );

  // gRPC - Users Service
  app.connectMicroservice<GrpcOptions>(
    grpcService.getOptions({
      packageName: 'nest.app',
      name: 'users',
    }),
  );

  await app.startAllMicroservices();

  const port = getEnvNumber('PORT', 3001);
  await app.listen(port, '0.0.0.0');

  logger.log(`${appName} is running on ${port}`);
  logger.log(`queue name is ${queueName}`);
}
bootstrap();
