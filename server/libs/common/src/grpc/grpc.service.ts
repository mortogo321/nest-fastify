import { Injectable } from '@nestjs/common';
import { type GrpcOptions, Transport } from '@nestjs/microservices';
import type { GrpcModuleOptions } from './grpc.module';
import { resolveProtoDir, resolveProtoPath } from './proto-path.util';

// Define gRPC port mappings for services
const GRPC_PORTS: Record<string, number> = {
  auth: 5001,
  users: 5002,
  alert: 5003,
  payment: 5004,
  worker: 5005,
};

@Injectable()
export class GrpcService {
  getOptions({ packageName, name }: GrpcModuleOptions): GrpcOptions {
    const port = GRPC_PORTS[name] || 5000;

    return {
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: resolveProtoPath(name),
        url: `0.0.0.0:${port}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [resolveProtoDir()],
        },
      },
    };
  }

  /**
   * Get client options for connecting to a gRPC service
   */
  getClientOptions({
    packageName,
    name,
    host = 'localhost',
  }: GrpcModuleOptions & { host?: string }): GrpcOptions {
    const port = GRPC_PORTS[name] || 5000;

    return {
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: resolveProtoPath(name),
        url: `${host}:${port}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [resolveProtoDir()],
        },
      },
    };
  }
}
