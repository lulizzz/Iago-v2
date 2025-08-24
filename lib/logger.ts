import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Create log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.colorize({ all: true })
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
      )
    ),
  }),
  
  // File transport for all logs
  new DailyRotateFile({
    filename: 'logs/iago-v2-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }),
  
  // Separate file for errors only
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Helper functions for structured logging
export const logRequest = (req: any, metadata?: Record<string, any>) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
    ...metadata,
  });
};

export const logResponse = (req: any, res: any, responseTime: number, metadata?: Record<string, any>) => {
  logger.http('HTTP Response', {
    method: req.method,
    url: req.url,
    statusCode: res.status,
    responseTime: `${responseTime}ms`,
    ...metadata,
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logChatEvent = (event: string, data?: Record<string, any>) => {
  logger.info('Chat Event', {
    event,
    ...data,
  });
};

export const logAuthEvent = (event: string, userId?: string, data?: Record<string, any>) => {
  logger.info('Auth Event', {
    event,
    userId,
    ...data,
  });
};

export const logDatabaseEvent = (operation: string, table?: string, data?: Record<string, any>) => {
  logger.debug('Database Event', {
    operation,
    table,
    ...data,
  });
};

export default logger;