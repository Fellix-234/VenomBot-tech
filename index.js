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
      <title>${config.bot.name} - Session Authentication</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          max-width: 1200px;
          width: 100%;
        }

        .header {
          text-align: center;
          margin-bottom: 50px;
          animation: slideDown 0.6s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo {
          font-size: 3.5em;
          margin-bottom: 15px;
        }

        .header h1 {
          font-size: 2.8em;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }

        .header p {
          font-size: 1.1em;
          color: #cbd5e1;
          font-weight: 300;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #475569;
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card:hover {
          border-color: #64748b;
          box-shadow: 0 8px 32px rgba(96, 165, 250, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          gap: 15px;
        }

        .card-icon {
          font-size: 2.8em;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          border-radius: 15px;
        }

        .card-title {
          font-size: 1.6em;
          font-weight: 600;
          color: #f1f5f9;
        }

        /* QR Code Section */
        .qr-display {
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin: 25px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 380px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .qr-display img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
        }

        .qr-loading {
          color: #666;
          font-size: 1.1em;
          text-align: center;
        }

        .instructions {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          color: white;
          font-size: 0.95em;
          line-height: 1.8;
        }

        .instructions ol {
          margin-left: 20px;
        }

        .instructions li {
          margin: 10px 0;
        }

        /* Pairing Section */
        .pairing-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-label {
          font-size: 0.85em;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          font-weight: 600;
        }

        .form-input {
          padding: 14px 18px;
          background: #0f172a;
          border: 2px solid #334155;
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 1em;
          transition: all 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          background: #1e293b;
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .code-display {
          background: #0f172a;
          border: 2px dashed #475569;
          border-radius: 12px;
          padding: 28px;
          text-align: center;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .code-display:hover {
          border-color: #60a5fa;
          background: #1e293b;
        }

        .pairing-code-text {
          font-size: 2em;
          font-weight: bold;
          font-family: 'Monaco', 'Courier New', monospace;
          letter-spacing: 3px;
          color: #34d399;
          word-break: break-all;
        }

        .code-placeholder {
          font-size: 0.95em;
          color: #64748b;
          font-style: italic;
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .button-group.full {
          grid-template-columns: 1fr;
        }

        .btn {
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          font-size: 0.95em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          color: #0f172a;
          font-weight: 700;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(96, 165, 250, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: #334155;
          color: #f1f5f9;
          border: 1px solid #475569;
        }

        .btn-secondary:hover {
          background: #475569;
          border-color: #64748b;
        }

        .btn-copy {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 700;
        }

        .btn-copy:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
        }

        .btn-refresh {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          font-weight: 700;
        }

        .btn-refresh:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(245, 158, 11, 0.3);
        }

        .status {
          padding: 14px;
          border-radius: 10px;
          font-size: 0.9em;
          text-align: center;
          display: none;
          margin-top: 12px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .status.show {
          display: block;
        }

        .status.success {
          background: #10b981;
          color: white;
          border: 1px solid #059669;
        }

        .status.error {
          background: #ef4444;
          color: white;
          border: 1px solid #dc2626;
        }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 0.9em;
          margin-top: 50px;
        }

        .footer a {
          color: #60a5fa;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer a:hover {
          color: #34d399;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .header h1 {
            font-size: 2.2em;
          }

          .card {
            padding: 30px;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .qr-pulse {
          animation: pulse 2s infinite;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🤖</div>
          <h1>${config.bot.name}</h1>
          <p>Session Authentication Center</p>
        </div>

        <div class="grid">
          <!-- QR Code Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon">📱</div>
              <div class="card-title">QR Code</div>
            </div>

            ${qrImage ? `
              <div class="qr-display qr-pulse">
                <img src="${qrImage}" alt="WhatsApp QR Code">
              </div>
              <button class="btn btn-refresh" onclick="location.reload()">🔄 Refresh QR Code</button>
              <p style="color: #64748b; margin-top: 15px; font-size: 0.9em;">Auto-refreshes every 30 seconds</p>
            ` : `
              <div class="qr-display">
                <div class="qr-loading">
                  <p style="margin-bottom: 10px;">⏳ Generating QR Code...</p>
                  <p style="font-size: 0.9em; color: #999;">The bot is initializing</p>
                </div>
              </div>
              <button class="btn btn-refresh" onclick="location.reload()">🔄 Try Again</button>
            `}

            <div class="instructions">
              <strong>📖 Connection Steps:</strong>
              <ol>
                <li>Open <strong>WhatsApp</strong> on your phone</li>
                <li>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Scan this QR code</li>
              </ol>
            </div>
          </div>

          <!-- Pairing Code Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon">🔐</div>
              <div class="card-title">Pairing Code</div>
            </div>

            <form id="pairingForm" class="pairing-form" onsubmit="return false;">
              <div class="form-group">
                <label class="form-label">📱 Phone Number</label>
                <input type="tel" id="phoneNumber" class="form-input" placeholder="e.g., 254701881604" maxlength="15">
                <small style="color: #64748b;">Include country code (no + or 00)</small>
              </div>

              <div class="form-group">
                <label class="form-label">🔑 Generated Code</label>
                <div class="code-display">
                  <span id="pairingCode" class="code-placeholder">Enter number first...</span>
                </div>
              </div>

              <button type="button" class="btn btn-primary" onclick="generatePairingCode()">⚡ Generate Code</button>

              <button type="button" class="btn btn-copy" onclick="copyPairingCode()" style="width: 100%;">📋 Copy Code</button>

              <div id="statusMessage" class="status"></div>

              <div class="instructions">
                <strong>📖 Pairing Steps:</strong>
                <ol>
                  <li>Enter your WhatsApp phone number</li>
                  <li>Click <strong>Generate Code</strong></li>
                  <li>Open <strong>WhatsApp</strong> on your phone</li>
                  <li>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                  <li>Tap <strong>Link with Phone Number</strong></li>
                  <li>Paste the generated code</li>
                </ol>
              </div>
            </form>
          </div>
        </div>

        <div class="footer">
          <p>✨ ${config.bot.name} v${config.bot.version} • Powered by Baileys</p>
          <p><a href="https://github.com/Fellix-234/VenomBot-Tech">📌 View on GitHub</a> • <a href="/">🏠 Back to Home</a></p>
        </div>
      </div>

      <script>
        function generatePairingCode() {
          const phoneNumber = document.getElementById('phoneNumber').value.trim();
          
          if (!phoneNumber) {
            showStatus('❌ Please enter a phone number', 'error');
            return;
          }

          if (!/^\\d{10,15}$/.test(phoneNumber)) {
            showStatus('❌ Invalid phone number format', 'error');
            return;
          }

          const code = generateRandomCode();
          document.getElementById('pairingCode').textContent = code;
          document.getElementById('pairingCode').classList.remove('code-placeholder');
          showStatus('✅ Code generated! Auto-refreshes in 30s', 'success');
          startCodeTimer();
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
          
          if (code === 'Enter number first...') {
            showStatus('❌ Generate a code first', 'error');
            return;
          }

          navigator.clipboard.writeText(code).then(() => {
            showStatus('✅ Code copied to clipboard!', 'success');
          }).catch(() => {
            showStatus('❌ Failed to copy code', 'error');
          });
        }

        function showStatus(message, type) {
          const status = document.getElementById('statusMessage');
          status.textContent = message;
          status.className = 'status show ' + type;
          
          setTimeout(() => {
            status.classList.remove('show');
          }, 3000);
        }

        let codeTimer;
        function startCodeTimer() {
          clearTimeout(codeTimer);
          codeTimer = setTimeout(() => {
            if (document.getElementById('pairingCode').textContent !== 'Enter number first...') {
              generatePairingCode();
            }
          }, 30000);
        }

        // Auto-refresh QR every 30 seconds
        setTimeout(() => location.reload(), 30000);
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
