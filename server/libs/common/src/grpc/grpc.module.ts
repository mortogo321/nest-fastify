import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcService } from './grpc.service';

interface GrpcModuleOptions {
  name: string;
}

@Module({
  providers: [GrpcService],
})
export class GrpcModule {
  static register({ name }: GrpcModuleOptions): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: `${name}_PACKAGE`,
            useFactory: () => ({
              transport: Transport.GRPC,
              options: {
                package: name.toUpperCase(),
                protoPath: join(__dirname, `**/**/libs/proto/${name}.proto`),
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
