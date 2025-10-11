import {
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
import { ApiModule } from './api.module';

async function bootstrap() {
  const appName = getEnv('APP_NAME', 'API');
  const appUrl = getEnv('APP_URL', 'http://localhost:3000');
  const app = await NestFactory.create<NestFastifyApplication>(ApiModule, new FastifyAdapter());

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
    crossOriginEmbedderPolicy: false, // Required for Swagger
  });

  // Security: Rate limiting
  await app.register(fastifyRateLimit, {
    max: getEnvNumber('RATE_LIMIT_MAX', 100),
    timeWindow: getEnvNumber('RATE_LIMIT_WINDOW', 60000), // 1 minute
    errorResponseBuilder: (_, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}`,
    }),
  });

  // Cookie handling
  await app.register(fastifyCookie, {
    secret: getRequiredEnv('JWT_SECRET'),
  });

  // API Versioning - URI-based (e.g., /v1/users, /v2/users)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Enable global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'], // Exclude health check and root from prefix
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
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false, // Explicit type conversion only
      },
      disableErrorMessages: !isDevelopment(), // Hide error details in production
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // queue
  const queueName = getRequiredEnv('API_QUEUE');
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions(queueName, true));

  // grpc
  const grpcService = app.get<GrpcService>(GrpcService);
  const grpcPackage = getRequiredEnv('GRPC_PACKAGE');
  app.connectMicroservice<GrpcOptions>(
    grpcService.getOptions({ packageName: grpcPackage, name: 'auth' }),
  );
  // app.connectMicroservice<GrpcOptions>(grpcService.getOptions('Alert'));
  // app.connectMicroservice<GrpcOptions>(grpcService.getOptions('Payment'));
  // app.connectMicroservice<GrpcOptions>(grpcService.getOptions('Worker'));

  await app.startAllMicroservices();

  const port = getEnvNumber('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`${appName} is running on ${port}`);
  logger.log(`queue name is ${queueName}`);
}
bootstrap();
