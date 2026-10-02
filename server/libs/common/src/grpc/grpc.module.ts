import { type DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcService } from './grpc.service';
import { resolveProtoDir, resolveProtoPath } from './proto-path.util';

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
                protoPath: resolveProtoPath(name),
                loader: {
                  includeDirs: [resolveProtoDir()],
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
