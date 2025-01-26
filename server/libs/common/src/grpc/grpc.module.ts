import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcService } from './grpc.service';

export interface GrpcModuleOptions {
  packageName: string;
  name: string;
}

@Module({
  providers: [GrpcService],
})
export class GrpcModule {
  static register({ packageName, name }: GrpcModuleOptions): DynamicModule {
    const clientName = `${packageName.replace('.', '_').replace('-', '_').toUpperCase()}_PACKAGE`;

    return {
      module: GrpcModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: clientName,
            useFactory: () => ({
              transport: Transport.GRPC,
              options: {
                package: packageName,
                protoPath: join(__dirname, '../../../proto', `${name}.proto`),
                loader: {
                  includeDirs: [join(__dirname, '../../../proto', 'proto')],
                },
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
