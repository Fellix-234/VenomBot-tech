import chalk from 'chalk';
import { config } from './src/config.js';
import { logger } from './src/utils/logger.js';
import { connectToWhatsApp } from './src/modules/connection.js';
import { initializeDatabase } from './src/database/db.js';
import { loadCommands } from './src/modules/commandHandler.js';

// Display banner
const displayBanner = () => {
  console.clear();
  console.log(chalk.cyan(`
╔══════════════════════════════════════╗
║                                      ║
║        ${chalk.bold.white('VENOMBOT TECH')}                  ║
║        ${chalk.gray('Professional WhatsApp Bot')}       ║
║                                      ║
║        Version: ${chalk.yellow(config.bot.version)}               ║
║        Prefix: ${chalk.green(config.bot.prefix)}                   ║
║                                      ║
╚══════════════════════════════════════╝
  `));
};

// Handle process errors
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

// Main function
const main = async () => {
  try {
    displayBanner();
    
    logger.info('🚀 Starting VenomBot...');
    
    // Initialize database
    logger.info('📦 Initializing database...');
    await initializeDatabase();
    
    // Load commands
    logger.info('⚙️  Loading commands...');
    await loadCommands();
    
    // Connect to WhatsApp
    logger.info('📱 Connecting to WhatsApp...');
    await connectToWhatsApp();
    
    logger.success('✨ Bot is ready!');
    
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Start the bot
main();
