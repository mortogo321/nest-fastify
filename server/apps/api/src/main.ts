import {
  ResponseInterceptor,
  ResponseMiddleware,
  RmqService,
  UnauthorizedExceptionFilter,
} from '@app/common';
import fastifyCookie from '@fastify/cookie';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AlertModule } from 'apps/alert/src/alert.module';
import { AuthModule } from 'apps/auth/src/auth.module';
import { PaymentModule } from 'apps/payment/src/payment.module';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({ logger: true }),
  );
  const appName = process.env.APP_NAME;
  const appUrl = process.env.APP_URL;

  if (process.env.NODE_ENV !== 'production') {
    // auth service
    let docName = 'Authentication';
    let documentConfig = new DocumentBuilder()
      .setTitle(`${docName} Service`)
      .setDescription(`${docName} Service API description`)
      .setVersion('1.0')
      .addTag(docName)
      .build();
    let documentFactory = (): OpenAPIObject => {
      return SwaggerModule.createDocument(app, documentConfig, {
        include: [AuthModule],
      });
    };

    SwaggerModule.setup('docs/auth', app, documentFactory);

    // alert service
    docName = 'Alert';
    documentConfig = new DocumentBuilder()
      .setTitle(`${docName} Service`)
      .setDescription(`${docName} Service API description`)
      .setVersion('1.0')
      .addTag(docName)
      .build();
    documentFactory = (): OpenAPIObject => {
      return SwaggerModule.createDocument(app, documentConfig, {
        include: [AlertModule],
      });
    };

    SwaggerModule.setup('docs/alert', app, documentFactory);

    // payment service
    docName = 'Payment';
    documentConfig = new DocumentBuilder()
      .setTitle(`${docName} Service`)
      .setDescription(`${docName} Service API description`)
      .setVersion('1.0')
      .addTag(docName)
      .build();
    documentFactory = (): OpenAPIObject => {
      return SwaggerModule.createDocument(app, documentConfig, {
        include: [PaymentModule],
      });
    };

    SwaggerModule.setup('docs/payment', app, documentFactory);
  }

  await app.register(fastifyCookie, {
    secret: process.env.JWT_SECRET,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  app.use(new ResponseMiddleware());

  const queueName = process.env.API_QUEUE;
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions(queueName, true));
  await app.startAllMicroservices();

  const port = process.env.PORT;
  await app.listen(port, '0.0.0.0');

  console.log(`queue name is ${queueName}`);
}
bootstrap();
