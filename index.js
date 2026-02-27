import chalk from 'chalk';
import express from 'express';
import QRCode from 'qrcode';
import { config } from './src/config.js';
import { logger } from './src/utils/logger.js';
import { connectToWhatsApp, getCurrentQR } from './src/modules/connection.js';
import { initializeDatabase } from './src/database/db.js';
import { loadCommands } from './src/modules/commandHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

// HTTP Server Routes
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
    uptime: process.uptime()
  });
});

app.get('/status', (req, res) => {
  res.json({
    bot: config.bot.name,
    prefix: config.bot.prefix,
    version: config.bot.version,
    uptime: process.uptime()
  });
});

// QR Code scanning page
app.get('/qr', async (req, res) => {
  const qrData = getCurrentQR();
  
  if (!qrData) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VenomBot - QR Code</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
          }
          h1 { margin-bottom: 10px; }
          p { font-size: 18px; margin: 10px 0; }
          .refresh-btn {
            margin-top: 20px;
            padding: 12px 30px;
            font-size: 16px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .refresh-btn:hover {
            background: #128C7E;
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 VenomBot</h1>
          <p>No QR code available</p>
          <p>The bot is either already connected or generating a new QR code.</p>
          <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VenomBot - Scan QR Code</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 500px;
          }
          h1 { 
            margin-bottom: 10px;
            font-size: 2.5em;
          }
          .qr-box {
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin: 20px auto;
            display: inline-block;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          .qr-box img {
            display: block;
            max-width: 100%;
            height: auto;
          }
          .instructions {
            font-size: 16px;
            line-height: 1.6;
            margin: 20px 0;
          }
          .step {
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
          }
          .refresh-btn {
            margin-top: 20px;
            padding: 12px 30px;
            font-size: 16px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .refresh-btn:hover {
            background: #128C7E;
            transform: scale(1.05);
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          .qr-box {
            animation: pulse 2s infinite;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 VenomBot</h1>
          <p style="font-size: 20px; margin-bottom: 20px;">📱 Scan QR Code to Connect</p>
          
          <div class="qr-box">
            <img src="${qrImage}" alt="WhatsApp QR Code">
          </div>

          <div class="instructions">
            <div class="step">1️⃣ Open <strong>WhatsApp</strong> on your phone</div>
            <div class="step">2️⃣ Go to <strong>Settings</strong> → <strong>Linked Devices</strong></div>
            <div class="step">3️⃣ Tap <strong>Link a Device</strong></div>
            <div class="step">4️⃣ Scan this QR code</div>
          </div>

          <button class="refresh-btn" onclick="location.reload()">🔄 Refresh QR Code</button>
          <p style="font-size: 14px; opacity: 0.8; margin-top: 15px;">QR Code refreshes automatically every 60 seconds</p>
        </div>
        <script>
          // Auto-refresh every 60 seconds
          setTimeout(() => location.reload(), 60000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    logger.error('Failed to generate QR code:', error.message);
    res.status(500).send('Failed to generate QR code');
  }
});

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
    logger.error('Failed to start bot:', error.message);
    logger.error('Stack:', error.stack);
    logger.warn('⚠️  Bot will retry in 10 seconds (HTTP server still active)');
    // Keep HTTP server running, retry bot
    setTimeout(() => {
      logger.info('🔄 Retrying bot connection...');
      main();
    }, 10000);
  }
};

// Start HTTP server first (so port is bound immediately)
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🌐 HTTP server running on port ${PORT}`);
  logger.info(`📱 Scan QR: http://localhost:${PORT}/qr`);
  logger.info('⏳ Bot is starting in the background...\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use!`);
    logger.error(`Try using PORT=3001 node index.js`);
    process.exit(1);
  } else {
    logger.error('Server error:', error);
    process.exit(1);
  }
});

// Start bot in background after server is listening
setImmediate(() => {
  main();
});
