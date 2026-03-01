import chalk from 'chalk';
import express from 'express';
import QRCode from 'qrcode';
import { config } from './src/config.js';
import { logger } from './src/utils/logger.js';
import { connectToWhatsApp } from './src/modules/connection.js';
import {
  generateSessionId,
  createSession,
  getSessionStatus,
  requestPairingCodeForSession,
  cleanupSession,
  cleanupAllSessions,
} from './src/modules/sessionManager.js';
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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
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

        .logo i {
          color: #667eea;
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .link-btn i {
          font-size: 14px;
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
          <div class="logo"><i class="fas fa-robot"></i></div>
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
            <a href="/session" class="link-btn link-btn-primary"><i class="fas fa-users-cog"></i> Session Panel</a>
            <a href="/health" class="link-btn link-btn-secondary"><i class="fas fa-heartbeat"></i> Health</a>
            <a href="/status" class="link-btn link-btn-secondary"><i class="fas fa-chart-bar"></i> Status JSON</a>
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

// API endpoint to request pairing code
app.post('/api/pairing-code', async (req, res) => {
  try {
    const { phoneNumber, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Validate phone number format
    if (!/^\d{10,15}$/.test(phoneNumber.toString().trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format (10-15 digits)'
      });
    }

    await createSession(sessionId);

    logger.info(`📱 Requesting pairing code for session ${sessionId}: ${phoneNumber}`);
    const pairingCode = await requestPairingCodeForSession(sessionId, phoneNumber);
    
    res.json({
      success: true,
      code: pairingCode,
      message: 'Pairing code generated successfully'
    });
  } catch (error) {
    logger.error('Pairing code error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate pairing code'
    });
  }
});

// API endpoint to check session status
app.get('/api/session-status', (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const status = getSessionStatus(sessionId);
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to clear session
app.post('/api/clear-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const cleared = await cleanupSession(sessionId);

    res.json({
      success: true,
      cleared,
      message: cleared
        ? 'Session cleared successfully'
        : 'Session not found or already cleared'
    });
  } catch (error) {
    logger.error('Failed to clear session:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear session'
    });
  }
});

// Cool Session Page with QR and Pairing Code
app.get('/session', async (req, res) => {
  let sessionId = req.query.sid;

  if (!sessionId) {
    sessionId = generateSessionId();
    return res.redirect(`/session?sid=${sessionId}`);
  }

  await createSession(sessionId);
  const status = getSessionStatus(sessionId);
  const qrData = status.qr;
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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #16213e 100%);
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
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
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
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .card {
          background: linear-gradient(135deg, #1a1a3a 0%, #16213e 100%);
          border: 1px solid #2d3561;
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
          border-color: #45b7d1;
          box-shadow: 0 8px 32px rgba(69, 183, 209, 0.15);
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
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
          border-radius: 15px;
        }

        .card-title {
          font-size: 1.6em;
          font-weight: 600;
          color: #f1f5f9;
        }

        /* Font Awesome Icons */
        .logo i {
          font-size: 3.5em;
          margin-bottom: 15px;
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-icon i {
          font-size: 2.2em;
          color: white;
          line-height: 1;
        }

        .form-label i,
        .btn i {
          margin-right: 8px;
        }

        .instructions i {
          margin-right: 6px;
          color: #45b7d1;
        }

        .footer i {
          margin-right: 6px;
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
          background: linear-gradient(135deg, #2d5a7d 0%, #1f4a5c 100%);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          color: white;
          font-size: 0.95em;
          line-height: 1.8;
          border-left: 4px solid #45b7d1;
        }

        .instructions ol {
          margin-left: 20px;
        }

        .instructions li {
          margin: 10px 0;
        }

        /* Method Tabs */
        .method-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 30px;
          background: #0f0f23;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid #2d3561;
        }

        .method-tab {
          padding: 14px 18px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.9em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .method-tab:hover {
          background: #1a1a3a;
          border-color: #2d3561;
          color: #cbd5e1;
        }

        .method-tab.active {
          background: linear-gradient(135deg, #45b7d1 0%, #4ecdc4 100%);
          border-color: #45b7d1;
          color: white;
          box-shadow: 0 4px 12px rgba(69, 183, 209, 0.3);
        }

        .method-content {
          display: none;
        }

        .method-content.active {
          display: block;
          animation: fadeIn 0.3s ease-in;
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
          background: #0f0f23;
          border: 2px solid #2d3561;
          border-radius: 10px;
          color: #e0e7ff;
          font-size: 1em;
          transition: all 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #45b7d1;
          box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.2);
          background: #1a1a3a;
        }

        .form-input::placeholder {
          color: #6b7280;
        }

        .code-display {
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
          border: 2px solid #2d3561;
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
          border-color: #45b7d1;
          background: linear-gradient(135deg, #1a1a3a 0%, #2d3561 100%);
        }

        #pairingCode {
          font-size: 2em;
          font-weight: bold;
          font-family: 'Monaco', 'Courier New', monospace;
          letter-spacing: 3px;
          color: #34d399;
          word-break: break-all;
        }

        .code-placeholder {
          font-size: 0.95em;
          color: #6b7280;
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
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
          color: white;
          font-weight: 700;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(255, 107, 107, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: #2d3561;
          color: #e0e7ff;
          border: 1px solid #45b7d1;
        }

        .btn-secondary:hover {
          background: #3d4571;
          border-color: #4ecdc4;
        }

        .btn-copy {
          background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
          color: white;
          font-weight: 700;
        }

        .btn-copy:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(78, 205, 196, 0.3);
        }

        .btn-refresh {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8b94 100%);
          color: white;
          font-weight: 700;
        }

        .btn-refresh:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(255, 107, 107, 0.3);
        }

        .status {
          padding: 14px;
          border-radius: 10px;
          font-size: 0.9em;
          text-align: center;
          display: none;
          margin-top: 12px;
          animation: slideIn 0.3s ease-out;
          font-weight: 600;
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
          background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
          color: white;
          border: 1px solid #2d9e9e;
        }

        .status.error {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          border: 1px solid #cc3333;
        }

        .footer {
          text-align: center;
          color: #9ca3af;
          font-size: 0.9em;
          margin-top: 50px;
        }

        .footer a {
          color: #4ecdc4;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }

        .footer a:hover {
          color: #45b7d1;
          border-bottom-color: #45b7d1;
        }

        /* Social Buttons */
        .social-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          text-decoration: none;
          font-size: 18px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .social-btn i {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-btn-whatsapp {
          background: linear-gradient(135deg, #25d366 0%, #20ba61 100%);
          color: white;
        }

        .social-btn-whatsapp:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
        }

        .social-btn-discord {
          background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
          color: white;
        }

        .social-btn-discord:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 8px 20px rgba(88, 101, 242, 0.4);
        }

        .social-btn-star {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #333;
        }

        .social-btn-star:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        .social-btn-fork {
          background: linear-gradient(135deg, #333 0%, #555 100%);
          color: white;
        }

        .social-btn-fork:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 8px 20px rgba(68, 68, 68, 0.4);
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
          <div class="logo"><i class="fas fa-robot"></i></div>
          <h1>${config.bot.name}</h1>
          <p>Session Authentication Center</p>
          
          <!-- Social Buttons -->
          <div class="social-buttons">
            <a href="https://wa.me/254725391914" class="social-btn social-btn-whatsapp" title="Contact Developer on WhatsApp" target="_blank">
              <i class="fab fa-whatsapp"></i>
            </a>
            <a href="https://discord.gg/venombot" class="social-btn social-btn-discord" title="Join Discord Community" target="_blank">
              <i class="fab fa-discord"></i>
            </a>
            <a href="https://github.com/Fellix-234/VenomBot-Tech" class="social-btn social-btn-star" title="Star on GitHub" target="_blank">
              <i class="fas fa-star"></i>
            </a>
            <a href="https://github.com/Fellix-234/VenomBot-Tech/fork" class="social-btn social-btn-fork" title="Fork on GitHub" target="_blank">
              <i class="fas fa-code-branch"></i>
            </a>
          </div>
        </div>

        <div class="grid">
          <!-- Unified Authentication Form -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon"><i class="fas fa-key"></i></div>
              <div class="card-title">Session Authentication</div>
            </div>

            <form id="authForm" class="pairing-form" onsubmit="return false;">
              <!-- QR Code Section -->
              <div class="form-group">
                <label class="form-label"><i class="fas fa-mobile-alt"></i> Method 1: QR Code</label>
                ${qrImage ? `
                  <div class="qr-display qr-pulse">
                    <img src="${qrImage}" alt="WhatsApp QR Code" style="max-width: 100%; height: auto;">
                  </div>
                  <button type="button" class="btn btn-secondary" onclick="location.href='/session?sid=${sessionId}'" style="width: 100%; margin-top: 12px;"><i class="fas fa-sync"></i> Refresh QR Code</button>
                  <p style="color: #64748b; margin-top: 10px; font-size: 0.85em; text-align: center;">Auto-refreshes every 30 seconds</p>
                ` : `
                  <div class="qr-display">
                    <div class="qr-loading">
                      <p style="margin-bottom: 10px;">⏳ Generating QR Code...</p>
                      <p style="font-size: 0.9em; color: #999;">The bot is initializing</p>
                    </div>
                  </div>
                  <button type="button" class="btn btn-secondary" onclick="location.href='/session?sid=${sessionId}'" style="width: 100%; margin-top: 12px;"><i class="fas fa-redo"></i> Try Again</button>
                `}

                <div class="instructions" style="margin-top: 15px;">
                  <strong style="color: #45b7d1;"><i class="fas fa-book"></i> QR Connection Steps:</strong>
                  <ol style="margin-top: 8px;">
                    <li>Open <strong>WhatsApp</strong> on your phone</li>
                    <li>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                    <li>Tap <strong>Link a Device</strong></li>
                    <li>Scan this QR code</li>
                  </ol>
                </div>
              </div>

              <!-- Divider -->
              <div style="margin: 25px 0; border-top: 1px solid #2d3561; padding-top: 20px;">
                <p style="text-align: center; color: #64748b; font-size: 0.85em; font-weight: 600;">— OR —</p>
              </div>

              <!-- Pairing Code Section -->
              <input type="hidden" id="sessionId" value="${sessionId}">

              <div class="form-group">
                <label class="form-label"><i class="fas fa-phone"></i> Method 2: Pairing Code</label>
                <input type="tel" id="phoneNumber" class="form-input" placeholder="254701881604" maxlength="15">
                <small style="color: #64748b;">Enter your WhatsApp number with country code (digits only, no + or spaces)</small>
              </div>

              <div class="form-group">
                <label class="form-label">Generated Pairing Code</label>
                <div class="code-display">
                  <span id="pairingCode" class="code-placeholder">Enter number above...</span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 15px;">
                <button type="button" class="btn btn-primary" onclick="generatePairingCode()" style="width: 100%; font-size: 1.1em; padding: 16px;"><i class="fas fa-bolt"></i> Generate Pairing Code</button>
              </div>

              <div id="statusMessage" class="status"></div>

              <div class="instructions" style="margin-top: 15px;">
                <strong style="color: #45b7d1;"><i class="fas fa-book"></i> Pairing Connection Steps:</strong>
                <ol style="margin-top: 8px;">
                  <li>Enter your WhatsApp phone number above (with country code)</li>
                  <li>Click <strong>Generate Pairing Code</strong> button</li>
                  <li>WhatsApp will send you a notification on your phone</li>
                  <li>Open WhatsApp and tap the notification</li>
                  <li>Or manually: Open <strong>WhatsApp</strong> → <strong>Settings</strong> → <strong>Linked Devices</strong> → <strong>Link with Phone Number</strong></li>
                  <li>Enter the generated code</li>
                  <li>Code is valid for 60 seconds only</li>
                </ol>
              </div>
            </form>
          </div>
        </div>

        <div class="footer">
          <p><i class="fas fa-sparkles"></i> ${config.bot.name} v${config.bot.version} • Powered by Baileys</p>
          <p><a href="https://github.com/Fellix-234/VenomBot-Tech"><i class="fas fa-code-branch"></i> View on GitHub</a> • <a href="/"><i class="fas fa-home"></i> Back to Home</a></p>
        </div>
      </div>

      <script>
        function generatePairingCode() {
          const sessionId = document.getElementById('sessionId').value.trim();
          const phoneNumber = document.getElementById('phoneNumber').value.trim();
          
          if (!phoneNumber) {
            showStatus('❌ Please enter a phone number', 'error');
            return;
          }

          if (!/^\\d{10,15}$/.test(phoneNumber)) {
            showStatus('❌ Invalid format. Use only digits (10-15 digits including country code)', 'error');
            return;
          }

          // Show loading state
          const button = event.target;
          button.disabled = true;
          button.innerHTML = '⏳ Requesting from WhatsApp...';
          showStatus('⏳ Connecting to WhatsApp servers...', 'success');

          // Call API to get real pairing code from WhatsApp
          fetch('/api/pairing-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber, sessionId })
          })
          .then(response => {
            if (!response.ok) {
              return response.json().then(data => {
                throw new Error(data.error || 'Server error');
              });
            }
            return response.json();
          })
          .then(data => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-bolt"></i> Generate Pairing Code';

            if (data.success) {
              // Format the code for display - ensure it's a string
              const formattedCode = String(data.code || '').trim();
              
              if (!formattedCode) {
                throw new Error('No code received from server');
              }
              
              document.getElementById('pairingCode').textContent = formattedCode;
              document.getElementById('pairingCode').classList.remove('code-placeholder');
              showStatus('✅ WhatsApp will send you a notification! Check your phone and enter this code: ' + formattedCode, 'success');
              console.log('Generated pairing code:', formattedCode);
              startCodeTimer();
            } else {
              showStatus('❌ ' + (data.error || 'Failed to generate code'), 'error');
            }
          })
          .catch(error => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-bolt"></i> Generate Pairing Code';
            console.error('Pairing code error:', error);
            
            let errorMsg = error.message;
            
            // Provide helpful error messages
            if (errorMsg.includes('Pairing')) {
              errorMsg = 'Pairing code not available. Try using the QR code method instead.';
            } else if (errorMsg.includes('not available')) {
              errorMsg = 'WhatsApp pairing not available in this Baileys version. Use QR code instead.';
            }
            
            showStatus('❌ Error: ' + errorMsg, 'error');
          });
        }

        function showStatus(message, type) {
          const status = document.getElementById('statusMessage');
          status.innerHTML = message;
          status.className = 'status show ' + type;
          
          setTimeout(() => {
            status.classList.remove('show');
          }, type === 'success' ? 8000 : 4000);
        }

        let codeTimer;
        function startCodeTimer() {
          clearTimeout(codeTimer);
          // WhatsApp pairing codes expire after 60 seconds
          codeTimer = setTimeout(() => {
            document.getElementById('pairingCode').textContent = 'Code expired. Generate again.';
            document.getElementById('pairingCode').classList.add('code-placeholder');
            showStatus('<i class="fas fa-exclamation-triangle"></i> Pairing code expired', 'error');
          }, 60000);
        }

        // Auto-refresh QR every 30 seconds
        setTimeout(() => {
          const sid = document.getElementById('sessionId').value;
          location.href = '/session?sid=' + encodeURIComponent(sid);
        }, 30000);
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
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await cleanupAllSessions();
  process.exit(0);
});

// Main function
const main = async () => {
  try {
    displayBanner();
    
    logger.divider();
    logger.panel('🚀 VENOMBOT STARTUP SEQUENCE', [
      chalk.cyan('▸') + ' Initializing deployment environment...',
    ]);
    
    // Initialize database
    logger.info('📦 Initializing database...');
    await initializeDatabase();
    logger.database('JSON/MongoDB Fallback', 'connected');
    
    // Load commands
    logger.info('⚙️  Loading commands...');
    await loadCommands();
    logger.commands(79, 79);
    
    // Optional single-account main bot connection
    if (config.settings.mainBotEnabled) {
      logger.info('📱 Connecting to WhatsApp (main bot mode)...');
      await connectToWhatsApp();
    } else {
      logger.info('🧩 Session panel mode active (MAIN_BOT_ENABLED=false)');
      logger.info('📝 Staff should connect via /session with their own Session ID');
    }
    
    logger.success('✨ Bot is ready!');
    logger.deployment({
      port: PORT,
      env: 'production',
      bot: config.bot,
      database: 'JSON (Fallback)',
    });
    
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
  logger.divider();
  logger.panel('🌐 HTTP SERVER ONLINE', [
    chalk.green('✓') + ' Server Status: ' + chalk.bold('Active'),
    chalk.green('✓') + ' Port: ' + chalk.bold(PORT),
    chalk.green('✓') + ' Interface: ' + chalk.bold('0.0.0.0'),
    chalk.blue('→') + ' Session Panel: ' + chalk.cyan(`http://localhost:${PORT}/session`),
    chalk.blue('→') + ' Health: ' + chalk.cyan(`http://localhost:${PORT}/health`),
  ]);
  logger.info('⏳ Bot initialization in progress...\n');
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
