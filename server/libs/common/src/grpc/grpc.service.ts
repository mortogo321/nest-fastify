import { Injectable } from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Injectable()
export class GrpcService {
  getOptions(name: string): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: name.toUpperCase(),
        protoPath: join(__dirname, '../../../proto', `${name}.proto`),
        loader: {
          includeDirs: [join(__dirname, '../../../proto', 'proto')],
        },
      },
    };
  }
}
