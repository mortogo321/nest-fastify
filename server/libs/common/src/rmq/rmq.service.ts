import { Injectable } from '@nestjs/common';
import { type RmqContext, type RmqOptions, Transport } from '@nestjs/microservices';
import { getRequiredEnv } from '../utils';

@Injectable()
export class RmqService {
  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [getRequiredEnv('RABBITMQ_URI')],
        queue: getRequiredEnv(`RABBIT_MQ_${queue}_QUEUE`),
        queueOptions: {
          durable: true,
        },
        noAck,
        persistent: true,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    channel.ack(message);
  }
}
