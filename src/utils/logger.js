import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create pino logger
const pinoLogger = pino({
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: {
          destination: path.join(logsDir, `bot-${new Date().toISOString().split('T')[0]}.log`),
          mkdir: true,
        },
      },
    ],
  },
});

// Custom logger with colors
export const logger = {
  info: (message, ...args) => {
    console.log(chalk.blue('[INFO]'), message, ...args);
    pinoLogger.info(message, ...args);
  },
  
  success: (message, ...args) => {
    console.log(chalk.green('[SUCCESS]'), message, ...args);
    pinoLogger.info(message, ...args);
  },
  
  warn: (message, ...args) => {
    console.log(chalk.yellow('[WARN]'), message, ...args);
    pinoLogger.warn(message, ...args);
  },
  
  error: (message, ...args) => {
    console.log(chalk.red('[ERROR]'), message, ...args);
    pinoLogger.error(message, ...args);
  },
  
  debug: (message, ...args) => {
    console.log(chalk.magenta('[DEBUG]'), message, ...args);
    pinoLogger.debug(message, ...args);
  },
  
  command: (user, command) => {
    console.log(chalk.cyan('[COMMAND]'), `${user} executed: ${command}`);
    pinoLogger.info(`Command: ${user} executed ${command}`);
  },
};
