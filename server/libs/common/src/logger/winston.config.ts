import { join } from 'node:path';
import { format, transports } from 'winston';

const logConsole = [
  new transports.Console({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss Z' }),
      format.colorize({ all: true }),
      format.simple(),
    ),
  }),
];

// File transports are built lazily so importing this module (e.g. in unit
// tests) never touches the filesystem. Override with LOG_DIR; defaults to a
// relative `logs/` directory instead of the previous hardcoded `/logs`.
function createFileTransports() {
  const logDir = process.env.LOG_DIR ?? 'logs';
  return [
    ...logConsole,
    new transports.File({
      format: format.combine(
        format.label({ label: process.env.APP_NAME }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss Z' }),
        format.colorize({ all: true }),
        format.simple(),
      ),
      filename: join(logDir, 'error.log'),
      level: 'error',
    }),
  ];
}

export const winstonConfig = {
  get transports() {
    return process.env.NODE_ENV !== 'production' ? logConsole : createFileTransports();
  },
};
