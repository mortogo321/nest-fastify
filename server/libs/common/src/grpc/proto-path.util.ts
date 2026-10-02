import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolve the directory containing the gRPC `.proto` files.
 *
 * Works from source (`libs/proto`, e.g. ts-node / local dev), from a
 * compiled build (`dist/proto`, populated by `bun run build:protos`),
 * and from legacy `__dirname`-relative layouts. Override with
 * `GRPC_PROTO_DIR`. Throws a clear error instead of failing later
 * inside the gRPC loader with a cryptic ENOENT.
 */
export function resolveProtoDir(): string {
  const override = process.env.GRPC_PROTO_DIR;
  const candidates = [
    ...(override ? [override] : []),
    join(process.cwd(), 'libs/proto'),
    join(process.cwd(), 'dist/proto'),
    join(__dirname, '..', '..', '..', 'proto'),
  ];

  for (const dir of candidates) {
    if (existsSync(join(dir, 'common.proto'))) {
      return dir;
    }
  }

  throw new Error(
    `gRPC proto directory not found (tried: ${candidates.join(', ')}). ` +
      'Set GRPC_PROTO_DIR or run a build that copies libs/proto to dist/proto.',
  );
}

/**
 * Resolve the absolute path of a service `.proto` file.
 */
export function resolveProtoPath(name: string): string {
  return join(resolveProtoDir(), `${name}.proto`);
}
