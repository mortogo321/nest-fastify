import {
    ResponseInterceptor,
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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AlertModule } from './alert.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AlertModule,
    new FastifyAdapter(),
  );
  const appName = process.env.APP_NAME;
  const appUrl = process.env.APP_URL;
  const documentConfig = new DocumentBuilder()
    .setTitle(`${appName} Service`)
    .setDescription(`${appName} Service API description`)
    .setVersion('1.0')
    .addTag(appName)
    .addServer(appUrl)
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);

  SwaggerModule.setup('docs', app, document);

  await app.register(fastifyCookie, {
    secret: process.env.JWT_SECRET,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  const queueName = process.env.ALERT_QUEUE;
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions(queueName, true));
  await app.startAllMicroservices();

  const port = process.env.PORT;
  await app.listen(port, '0.0.0.0');

  console.log(`${appName} is running on ${port}`);
  console.log(`queue name is ${queueName}`);
}
bootstrap();
