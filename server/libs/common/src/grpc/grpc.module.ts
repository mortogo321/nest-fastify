import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcService } from './grpc.service';

interface GrpcModuleOptions {
  name: string;
  protoPath: string;
}

@Module({
  providers: [GrpcService],
})
export class GrpcModule {
  static register({ name, protoPath }: GrpcModuleOptions): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: `${name}_PACKAGE`,
            useFactory: () => ({
              transport: Transport.GRPC,
              options: {
                package: process.env[`GRPC_${name}`],
                protoPath,
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
