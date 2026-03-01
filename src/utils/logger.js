import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const logsDir = isVercel ? '/tmp/logs' : path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist (skip on Vercel serverless)
let logFileEnabled = true;
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  logFileEnabled = false;
  console.warn('[WARN] File logging disabled (read-only filesystem)');
}

// Create pino logger (console-only on Vercel)
const pinoLogger = logFileEnabled
  ? pino({
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
    })
  : pino({ level: 'info' });

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

  // Professional panel logging for deployment
  panel: (title, items = []) => {
    console.log('\n' + chalk.cyan('┌─ ' + title + ' ' + '─'.repeat(Math.max(0, 50 - title.length)) + '┐'));
    items.forEach((item) => {
      console.log(chalk.cyan('│') + ' ' + item);
    });
    console.log(chalk.cyan('└' + '─'.repeat(54) + '┘\n'));
  },

  section: (title) => {
    console.log('\n' + chalk.bold.cyan('▌ ' + title));
    console.log(chalk.cyan('├─ '));
  },

  deployment: (config) => {
    const items = [
      chalk.green('✓') + ' Server: ' + chalk.bold('Running'),
      chalk.green('✓') + ' Port: ' + chalk.bold(config.port || 3000),
      chalk.green('✓') + ' Environment: ' + chalk.bold(config.env || 'production'),
      config.database && (chalk.green('✓') + ' Database: ' + chalk.bold(config.database)),
      config.bot && (chalk.green('✓') + ' Bot: ' + chalk.bold(config.bot.name)),
    ].filter(Boolean);
    
    logger.panel('🚀 DEPLOYMENT READY', items);
  },

  commands: (loaded, total) => {
    const percentage = ((loaded / total) * 100).toFixed(0);
    logger.panel('📦 COMMANDS LOADED', [
      chalk.blue('  →') + ' ' + chalk.green(loaded) + '/' + chalk.yellow(total) + ' commands loaded',
      chalk.blue('  →') + ' ' + chalk.cyan(percentage + '% complete'),
    ]);
  },

  database: (type, status) => {
    const icon = status === 'connected' ? chalk.green('✓') : status === 'warning' ? chalk.yellow('⚠') : chalk.red('✗');
    logger.panel('🗄️  DATABASE', [
      icon + ' Type: ' + chalk.bold(type),
      icon + ' Status: ' + chalk.bold(status),
    ]);
  },

  api: (routes = []) => {
    const items = routes.length > 0 ? routes.map(route => chalk.blue('→') + ' ' + chalk.cyan(route)) : [chalk.gray('No routes configured')];
    logger.panel('🔌 API ENDPOINTS', items);
  },

  sessions: (count, active) => {
    logger.panel('💾 SESSIONS', [
      chalk.green('✓') + ' Total: ' + chalk.bold(count),
      chalk.yellow('●') + ' Active: ' + chalk.bold(active),
    ]);
  },

  divider: () => {
    console.log(chalk.dim('═'.repeat(60)));
  },
};
