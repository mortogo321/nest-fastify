import { Injectable } from '@nestjs/common';
import { type GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import type { GrpcModuleOptions } from './grpc.module';

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
        protoPath: join(__dirname, '../../../proto', `${name}.proto`),
        url: `0.0.0.0:${port}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
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
        protoPath: join(__dirname, '../../../proto', `${name}.proto`),
        url: `${host}:${port}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    };
  }
}
