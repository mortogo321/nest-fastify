import { format, transports } from 'winston';

const logFile = [
  new transports.File({
    format: format.combine(
      format.label({ label: process.env.APP_NAME }),
      format.timestamp(),
      format.colorize(),
      format.simple(),
    ),
    filename: '/logs/error.log',
    level: 'error',
  }),
];

const logConsole = [
  new transports.Console({
    format: format.combine(
      format.timestamp(),
      format.colorize(),
      format.simple(),
    ),
  }),
];

export const winstonConfig = {
  transports: process.env.NODE_ENV !== 'production' ? logConsole : logFile,
};
