import express from 'express';
import { connectToWhatsApp } from './src/modules/connection.js';
import { initializeDatabase } from './src/database/db.js';
import { loadCommands } from './src/modules/commandHandler.js';
import { logger } from './src/utils/logger.js';
import { config } from './src/config.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: config.bot.name,
    version: config.bot.version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

app.get('/status', (req, res) => {
  res.json({
    bot: config.bot.name,
    prefix: config.bot.prefix,
    version: config.bot.version,
    settings: config.settings,
    uptime: process.uptime()
  });
});

// Start HTTP server first (for Render port detection)
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🌐 HTTP server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/`);
  
  // Now start the bot
  startBot();
});

// Display banner
const displayBanner = () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║                                      ║');
  console.log('║        VENOMBOT TECH                  ║');
  console.log('║        Professional WhatsApp Bot       ║');
  console.log('║                                      ║');
  console.log(`║        Version: ${config.bot.version}               ║`);
  console.log(`║        Prefix: ${config.bot.prefix}                   ║`);
  console.log('║                                      ║');
  console.log('╚══════════════════════════════════════╝\n');
};

// Start bot function
const startBot = async () => {
  try {
    displayBanner();
    logger.info('🚀 Starting VenomBot...');
    
    logger.info('📦 Initializing database...');
    await initializeDatabase();
    
    logger.info('⚙️  Loading commands...');
    await loadCommands();
    
    logger.info('📱 Connecting to WhatsApp...');
    await connectToWhatsApp();
    
    logger.success('✨ Bot is ready!');
  } catch (error) {
    logger.error('Failed to start bot:', error.message);
    logger.error('Stack:', error.stack);
    // Don't exit - keep HTTP server running for health checks
    setTimeout(() => {
      logger.info('Retrying bot connection...');
      startBot();
    }, 10000); // Retry after 10 seconds
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down...');
  process.exit(0);
});
