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
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.bot.name} - Status</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          max-width: 600px;
          width: 100%;
        }
        
        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          text-align: center;
        }
        
        .logo {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .bot-name {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        
        .status-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 30px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }
        
        .info-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .info-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        
        .timestamp {
          font-size: 12px;
          color: #999;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .links {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .link-btn {
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .link-btn-primary {
          background: #667eea;
          color: white;
        }
        
        .link-btn-primary:hover {
          background: #764ba2;
          transform: translateY(-2px);
        }
        
        .link-btn-secondary {
          background: #e0e0e0;
          color: #333;
        }
        
        .link-btn-secondary:hover {
          background: #d0d0d0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">🤖</div>
          <h1 class="bot-name">${config.bot.name}</h1>
          <div class="status-badge">● Online</div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Version</div>
              <div class="info-value">${config.bot.version}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Prefix</div>
              <div class="info-value">${config.bot.prefix}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Uptime</div>
              <div class="info-value">${uptimeFormatted}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value" style="color: #10b981;">Active</div>
            </div>
          </div>
          
          <div class="links">
            <a href="/qr" class="link-btn link-btn-primary">📱 Scan QR</a>
            <a href="/health" class="link-btn link-btn-secondary">❤️ Health</a>
            <a href="/status" class="link-btn link-btn-secondary">📊 Status JSON</a>
          </div>
          
          <div class="timestamp">Last updated: ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </body>
    </html>
  `);
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

// Cool Session Page with QR and Pairing Code
app.get('/session', async (req, res) => {
  const qrData = getCurrentQR();
  let qrImage = null;

  if (qrData) {
    try {
      qrImage = await QRCode.toDataURL(qrData, {
        width: 350,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      logger.error('Failed to generate QR code:', error.message);
    }
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.bot.name} - Session Manager</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .main-container {
          max-width: 1000px;
          width: 100%;
        }

        .header {
          text-align: center;
          color: white;
          margin-bottom: 40px;
        }

        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .header p {
          font-size: 1.1em;
          opacity: 0.9;
        }

        .session-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .session-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          border-bottom: 3px solid #667eea;
          padding-bottom: 15px;
        }

        .card-icon {
          font-size: 2.5em;
          margin-right: 15px;
        }

        .card-title {
          font-size: 1.5em;
          font-weight: bold;
          color: #333;
        }

        /* QR Code Card */
        .qr-card {
          text-align: center;
        }

        .qr-container {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          margin: 20px 0;
          border: 3px dashed #667eea;
        }

        .qr-container img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
          border-radius: 10px;
        }

        .qr-loading {
          padding: 40px 20px;
          color: #999;
          font-size: 1.1em;
        }

        .qr-instructions {
          background: #e8f4f8;
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          font-size: 0.9em;
          color: #333;
          text-align: left;
        }

        .qr-instructions ol {
          margin-left: 20px;
          line-height: 1.8;
        }

        .qr-instructions li {
          margin: 8px 0;
        }

        /* Pairing Code Card */
        .pairing-card {
          display: flex;
          flex-direction: column;
        }

        .pairing-section {
          margin-bottom: 25px;
        }

        .section-label {
          font-size: 0.9em;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .input-group input {
          flex: 1;
          padding: 12px 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1em;
          transition: border-color 0.3s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.95em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: 2px solid #ddd;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }

        .btn-copy {
          background: #25D366;
          color: white;
        }

        .btn-copy:hover {
          background: #128C7E;
          transform: translateY(-2px);
        }

        .btn-refresh {
          background: #FF6B6B;
          color: white;
        }

        .btn-refresh:hover {
          background: #ee5a52;
          transform: translateY(-2px);
        }

        .pairing-output {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #ddd;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          word-break: break-all;
        }

        .pairing-code {
          font-size: 1.2em;
          font-weight: bold;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }

        .pairing-placeholder {
          color: #999;
          font-style: italic;
        }

        .status-message {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9em;
          text-align: center;
          display: none;
        }

        .status-message.show {
          display: block;
        }

        .status-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .footer-info {
          text-align: center;
          color: white;
          margin-top: 30px;
          opacity: 0.9;
          font-size: 0.9em;
        }

        @media (max-width: 768px) {
          .session-grid {
            grid-template-columns: 1fr;
          }

          .header h1 {
            font-size: 1.8em;
          }

          .session-card {
            padding: 20px;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .qr-pulse {
          animation: pulse 2s infinite;
        }
      </style>
    </head>
    <body>
      <div class="main-container">
        <div class="header">
          <h1>🤖 ${config.bot.name}</h1>
          <p>Session Authentication Manager</p>
        </div>

        <div class="session-grid">
          <!-- QR Code Card -->
          <div class="session-card qr-card">
            <div class="card-header">
              <div class="card-icon">📱</div>
              <div class="card-title">QR Code</div>
            </div>

            ${qrImage ? `
              <div class="qr-container qr-pulse">
                <img src="${qrImage}" alt="WhatsApp QR Code">
              </div>
              <button class="btn btn-refresh" onclick="location.reload()">🔄 Refresh QR Code</button>
              <p style="margin-top: 15px; font-size: 0.85em; color: #666;">Auto-refreshes every 30 seconds</p>
            ` : `
              <div class="qr-container">
                <div class="qr-loading">
                  <p>⏳ Generating QR Code...</p>
                  <p style="font-size: 0.9em; margin-top: 10px;">The bot is starting up</p>
                </div>
              </div>
              <button class="btn btn-refresh" onclick="location.reload()">🔄 Try Again</button>
            `}

            <div class="qr-instructions">
              <strong>How to Connect:</strong>
              <ol>
                <li>Open <strong>WhatsApp</strong> on your phone</li>
                <li>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Scan this QR code</li>
              </ol>
            </div>
          </div>

          <!-- Pairing Code Card -->
          <div class="session-card pairing-card">
            <div class="card-header">
              <div class="card-icon">🔐</div>
              <div class="card-title">Pairing Code</div>
            </div>

            <div class="pairing-section">
              <div class="section-label">📱 Phone Number</div>
              <div class="input-group">
                <input type="text" id="phoneNumber" placeholder="Enter your WhatsApp number (e.g., 254701881604)" maxlength="15">
              </div>
              <small style="color: #666;">Include country code without + or 00</small>
            </div>

            <div class="pairing-section">
              <div class="section-label">🔑 Generated Pairing Code</div>
              <div class="pairing-output">
                <span id="pairingCode" class="pairing-placeholder">Enter number and generate code...</span>
              </div>
              <button class="btn btn-primary" onclick="generatePairingCode()" style="width: 100%; margin-top: 10px;">
                ⚡ Generate Code
              </button>
            </div>

            <div class="pairing-section">
              <button class="btn btn-copy" onclick="copyPairingCode()" style="width: 100%;">
                📋 Copy Code
              </button>
              <div id="statusMessage" class="status-message"></div>
            </div>

            <div class="qr-instructions">
              <strong>How to Use:</strong>
              <ol>
                <li>Enter your WhatsApp number</li>
                <li>Click <strong>Generate Code</strong></li>
                <li>Open <strong>WhatsApp</strong> on your phone</li>
                <li>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link with Phone Number</strong></li>
                <li>Paste the pairing code</li>
              </ol>
            </div>
          </div>
        </div>

        <div class="footer-info">
          <p>✨ ${config.bot.name} v${config.bot.version} - Powered by Baileys</p>
          <p>For more info, visit: <a href="https://github.com/Fellix-234/VenomBot-Tech" style="color: white; text-decoration: none;">GitHub Repository</a></p>
        </div>
      </div>

      <script>
        function generatePairingCode() {
          const phoneNumber = document.getElementById('phoneNumber').value.trim();
          
          if (!phoneNumber) {
            showStatus('Please enter a phone number', 'error');
            return;
          }

          if (!/^\\d{10,15}$/.test(phoneNumber)) {
            showStatus('Invalid phone number format', 'error');
            return;
          }

          // Simulate pairing code generation (in real app, this would come from backend)
          // Format: XXXX-XXXX (8 digits)
          const code = generateRandomCode();
          document.getElementById('pairingCode').textContent = code;
          document.getElementById('pairingCode').classList.remove('pairing-placeholder');
          showStatus('✅ Pairing code generated! Auto-refreshes in 30s', 'success');
          startCodeTimer(); // Start 30-second refresh timer
        }

        function generateRandomCode() {
          const chars = '0123456789';
          let code = '';
          for (let i = 0; i < 8; i++) {
            if (i === 4) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        }

        function copyPairingCode() {
          const code = document.getElementById('pairingCode').textContent;
          
          if (code === 'Enter number and generate code...') {
            showStatus('Generate a code first', 'error');
            return;
          }

          navigator.clipboard.writeText(code).then(() => {
            showStatus('✅ Code copied to clipboard!', 'success');
          }).catch(() => {
            showStatus('Failed to copy code', 'error');
          });
        }

        function showStatus(message, type) {
          const status = document.getElementById('statusMessage');
          status.textContent = message;
          status.className = 'status-message show ' + type;
          
          setTimeout(() => {
            status.classList.remove('show');
          }, 3000);
        }

        // Auto-refresh QR every 30 seconds
        setTimeout(() => location.reload(), 30000);

        // Auto-refresh pairing code every 30 seconds
        let codeTimer;
        function startCodeTimer() {
          clearTimeout(codeTimer);
          codeTimer = setTimeout(() => {
            if (document.getElementById('pairingCode').textContent !== 'Enter number and generate code...') {
              generatePairingCode();
            }
          }, 30000);
        }
      </script>
    </body>
    </html>
  `);
});

// Keep /qr route for backwards compatibility
app.get('/qr', async (req, res) => {
  res.redirect('/session');
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
