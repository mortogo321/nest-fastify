import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveProtoDir, resolveProtoPath } from './proto-path.util';

describe('resolveProtoDir', () => {
  it('should resolve to a directory containing the shared protos', () => {
    const dir = resolveProtoDir();
    expect(existsSync(`${dir}/common.proto`)).toBe(true);
  });
});

describe('resolveProtoPath', () => {
  it('should resolve known service protos to existing files', () => {
    for (const name of ['auth', 'users', 'alert', 'payment', 'worker']) {
      const path = resolveProtoPath(name);
      expect(path.endsWith(`/${name}.proto`)).toBe(true);
      expect(existsSync(path)).toBe(true);
    }
  });
});
