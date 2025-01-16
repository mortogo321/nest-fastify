import { Injectable } from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcModuleOptions } from './grpc.module';

@Injectable()
export class GrpcService {
  getOptions({ packageName, name }: GrpcModuleOptions): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: join(__dirname, '../../../proto', `${name}.proto`),
        loader: {
          includeDirs: [join(__dirname, '../../../proto', 'proto')],
        },
      },
    };
  }
}
