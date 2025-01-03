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

const logFile = [
  ...logConsole,
  new transports.File({
    format: format.combine(
      format.label({ label: process.env.APP_NAME }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss Z' }),
      format.colorize({ all: true }),
      format.simple(),
    ),
    filename: '/logs/error.log',
    level: 'error',
  }),
];

export const winstonConfig = {
  transports: process.env.NODE_ENV !== 'production' ? logConsole : logFile,
};
