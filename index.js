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
    
    // Add request timeout (30 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Pairing code request timeout - WhatsApp server not responding')), 30000)
    );
    
    const pairingPromise = requestPairingCodeForSession(sessionId, phoneNumber);
    const pairingCode = await Promise.race([pairingPromise, timeoutPromise]);
    
    res.json({
      success: true,
      code: pairingCode,
      message: 'Pairing code generated successfully. Check WhatsApp on your phone.'
    });
  } catch (error) {
    logger.error('Pairing code error:', error.message);
    
    let userError = error.message;
    let suggestion = '';
    
    // Add helpful suggestions for common errors
    if (error.message.includes('not found') || error.message.includes('not function')) {
      userError = 'Pairing code feature unavailable';
      suggestion = ' - Please use the QR code method instead.';
    } else if (error.message.includes('Baileys')) {
      userError = 'Baileys compatibility issue';
      suggestion = ' - Try using QR code method or refresh the page.';
    }
    
    res.status(500).json({
      success: false,
      error: userError + suggestion || 'Failed to generate pairing code'
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

  // Get all active sessions for dashboard
  const sessionsInfo = [];

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.bot.name} - Session Authentication</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #667eea;
          --secondary: #764ba2;
          --accent: #f093fb;
          --success: #4ecdc4;
          --danger: #ff6b6b;
          --dark-bg: #0f0f23;
          --dark-card: #1a1a3a;
          --dark-border: #2d3561;
          --light-text: #e0e7ff;
          --muted-text: #94a3b8;
          --light-bg: #ffffff;
          --light-card: #f3f4f6;
          --light-border: #e5e7eb;
        }

        body {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, var(--dark-bg) 0%, var(--dark-card) 50%, #16213e 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: var(--light-text);
          transition: background 0.4s ease;
        }

        body.light-mode {
          background: linear-gradient(135deg, var(--light-bg) 0%, #f9fafb 50%, #f3f4f6 100%);
          color: #1f2937;
        }

        /* Animated background particles */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: -1;
        }

        .particle {
          position: absolute;
          pointer-events: none;
          opacity: 0.5;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .particle {
          animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
        }

        .container {
          max-width: 1200px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        /* Theme Toggle */
        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .theme-toggle:hover {
          transform: scale(1.1) rotate(20deg);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .theme-toggle:active {
          transform: scale(0.95);
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 60px;
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
          font-size: 4em;
          margin-bottom: 20px;
          display: inline-block;
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .header h1 {
          font-size: 3.2em;
          font-weight: 700;
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          letter-spacing: -1.5px;
        }

        body.light-mode .header h1 {
          -webkit-text-fill-color: #667eea;
        }

        .header p {
          font-size: 1.15em;
          color: var(--muted-text);
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        /* Grid Layout */
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 40px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Cards */
        .card {
          background: linear-gradient(135deg, var(--dark-card) 0%, #16213e 100%);
          border: 1px solid var(--dark-border);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        body.light-mode .card {
          background: rgba(255, 255, 255, 0.95);
          border-color: var(--light-border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .card:hover::before {
          left: 100%;
        }

        .card:hover {
          border-color: #45b7d1;
          box-shadow: 0 12px 40px rgba(69, 183, 209, 0.2);
          transform: translateY(-5px);
        }

        body.light-mode .card:hover {
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          gap: 15px;
          position: relative;
          z-index: 1;
        }

        .card-icon {
          font-size: 2.8em;
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          flex-shrink: 0;
        }

        .card-title {
          font-size: 1.6em;
          font-weight: 600;
          color: var(--light-text);
        }

        body.light-mode .card-title {
          color: #1f2937;
        }

        .card-icon i {
          font-size: 2.2em;
          color: white;
          line-height: 1;
        }

        /* QR Code Section */
        .qr-display {
          background: white;
          padding: 35px;
          border-radius: 18px;
          margin: 30px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .qr-display::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 3px dashed #667eea;
          border-radius: 15px;
          animation: pulse-border 2s infinite;
          pointer-events: none;
        }

        @keyframes pulse-border {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }

        .qr-display img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
        }

        .qr-loading {
          color: #666;
          font-size: 1.1em;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        /* Form Styles */
        .pairing-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          z-index: 1;
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
          color: var(--muted-text);
          font-weight: 600;
        }

        body.light-mode .form-label {
          color: #6b7280;
        }

        .form-input {
          padding: 14px 16px;
          background: var(--dark-bg);
          border: 2px solid var(--dark-border);
          border-radius: 12px;
          color: var(--light-text);
          font-size: 1em;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
        }

        body.light-mode .form-input {
          background: #f9fafb;
          border-color: var(--light-border);
          color: #1f2937;
        }

        .form-input:focus {
          outline: none;
          border-color: #45b7d1;
          box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.2);
          background: var(--dark-card);
        }

        body.light-mode .form-input:focus {
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: var(--muted-text);
        }

        /* Code Display */
        .code-display {
          background: linear-gradient(135deg, var(--dark-bg) 0%, var(--dark-card) 100%);
          border: 2px solid var(--dark-border);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        body.light-mode .code-display {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-color: var(--light-border);
        }

        .code-display:hover {
          border-color: #45b7d1;
          background: linear-gradient(135deg, var(--dark-card) 0%, #2d3561 100%);
          box-shadow: 0 4px 15px rgba(69, 183, 209, 0.2);
        }

        #pairingCode {
          font-size: 2.2em;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 4px;
          color: #34d399;
          word-break: break-all;
          position: relative;
          z-index: 1;
        }

        .code-placeholder {
          font-size: 0.95em;
          color: var(--muted-text);
          font-style: italic;
        }

        /* Instructions */
        .instructions {
          background: linear-gradient(135deg, rgba(45, 90, 125, 0.4) 0%, rgba(31, 74, 92, 0.4) 100%);
          padding: 22px;
          border-radius: 12px;
          margin: 20px 0;
          color: var(--light-text);
          font-size: 0.95em;
          line-height: 1.8;
          border-left: 4px solid #45b7d1;
          backdrop-filter: blur(8px);
        }

        body.light-mode .instructions {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-left-color: #667eea;
          color: #1f2937;
        }

        .instructions ol {
          margin-left: 25px;
          margin-top: 10px;
        }

        .instructions li {
          margin: 12px 0;
          font-weight: 500;
        }

        /* Button Styles */
        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 10px;
        }

        .button-group.full {
          grid-template-columns: 1fr;
        }

        .btn {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 0.95em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
        }

        .btn-primary:active {
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--dark-card);
          color: var(--light-text);
          border: 2px solid var(--dark-border);
          transition: all 0.3s ease;
        }

        body.light-mode .btn-secondary {
          background: var(--light-card);
          color: #1f2937;
          border-color: var(--light-border);
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, var(--dark-border) 0%, #3d4571 100%);
          border-color: #45b7d1;
          transform: translateY(-2px);
        }

        body.light-mode .btn-secondary:hover {
          background: white;
          border-color: #667eea;
          color: #667eea;
        }

        /* Status Messages */
        .status {
          padding: 16px 18px;
          border-radius: 10px;
          font-size: 0.9em;
          text-align: center;
          display: none;
          margin-top: 15px;
          animation: slideIn 0.3s ease-out;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
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
          box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
        }

        .status.error {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          border: 1px solid #cc3333;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        body.light-mode .status.success {
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }

        body.light-mode .status.error {
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
        }

        /* Social Buttons */
        .social-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          text-decoration: none;
          font-size: 20px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
          transform: translateY(-5px) scale(1.12);
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
        }

        .social-btn-discord {
          background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
          color: white;
        }

        .social-btn-discord:hover {
          transform: translateY(-5px) scale(1.12);
          box-shadow: 0 10px 25px rgba(88, 101, 242, 0.4);
        }

        .social-btn-star {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #333;
        }

        .social-btn-star:hover {
          transform: translateY(-5px) scale(1.12);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
        }

        .social-btn-fork {
          background: linear-gradient(135deg, #333 0%, #555 100%);
          color: white;
        }

        .social-btn-fork:hover {
          transform: translateY(-5px) scale(1.12);
          box-shadow: 0 10px 25px rgba(68, 68, 68, 0.4);
        }

        /* Footer */
        .footer {
          text-align: center;
          color: var(--muted-text);
          font-size: 0.9em;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid var(--dark-border);
        }

        body.light-mode .footer {
          color: #6b7280;
          border-top-color: var(--light-border);
        }

        .footer a {
          color: #4ecdc4;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }

        body.light-mode .footer a {
          color: #667eea;
        }

        .footer a:hover {
          color: #45b7d1;
          border-bottom-color: #45b7d1;
        }

        .footer p {
          margin: 8px 0;
        }

        .footer i {
          margin-right: 6px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .theme-toggle {
            width: 45px;
            height: 45px;
            font-size: 18px;
          }

          .header {
            margin-bottom: 40px;
          }

          .logo {
            font-size: 3em;
          }

          .header h1 {
            font-size: 2.2em;
          }

          .header p {
            font-size: 1em;
          }

          .card {
            padding: 30px 25px;
          }

          .card-header {
            gap: 12px;
          }

          .card-icon {
            width: 55px;
            height: 55px;
            font-size: 2.2em;
          }

          .card-icon i {
            font-size: 1.8em;
          }

          .card-title {
            font-size: 1.35em;
          }

          .btn {
            padding: 12px 18px;
            font-size: 0.85em;
            gap: 8px;
          }

          .button-group {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .qr-display {
            min-height: 320px;
            padding: 20px;
          }

          #pairingCode {
            font-size: 1.6em;
            letter-spacing: 2px;
          }

          .form-label {
            font-size: 0.8em;
          }

          .form-input {
            padding: 12px 14px;
            font-size: 16px;
          }

          .instructions {
            font-size: 0.9em;
            padding: 16px;
          }

          .instructions ol {
            margin-left: 20px;
          }

          .instructions li {
            margin: 8px 0;
          }

          .footer {
            margin-top: 40px;
            font-size: 0.85em;
          }

          .social-buttons {
            gap: 12px;
          }

          .social-btn {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
        }

        @media (max-width: 480px) {
          body {
            padding: 15px;
          }

          .header {
            margin-bottom: 35px;
          }

          .logo {
            font-size: 2.5em;
            margin-bottom: 15px;
          }

          .header h1 {
            font-size: 1.8em;
            margin-bottom: 8px;
          }

          .header p {
            font-size: 0.9em;
          }

          .social-buttons {
            gap: 10px;
            margin-top: 20px;
          }

          .card {
            padding: 20px;
            gap: 20px;
          }

          .card-title {
            font-size: 1.1em;
          }

          .card-header {
            gap: 10px;
          }

          .card-icon {
            width: 45px;
            height: 45px;
          }

          .card-icon i {
            font-size: 1.6em;
          }

          .qr-display {
            min-height: 280px;
            padding: 15px;
          }

          .status {
            font-size: 0.85em;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        .hidden {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <!-- Particles Background -->
      <div class="particles" id="particlesContainer"></div>

      <!-- Theme Toggle Button -->
      <button class="theme-toggle" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
        <i class="fas fa-moon" id="themeIcon"></i>
      </button>

      <div class="container">
        <!-- Header Section -->
        <div class="header">
          <div class="logo"><i class="fas fa-robot"></i></div>
          <h1>${config.bot.name}</h1>
          <p>🔐 Session Authentication Center</p>
          
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

        <!-- Main Grid -->
        <div class="grid">
          <!-- Main Authentication Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon"><i class="fas fa-key"></i></div>
              <div>
                <div class="card-title">Session Authentication</div>
                <small style="color: var(--muted-text); display: block; margin-top: 4px;">Secure Connection Setup</small>
              </div>
            </div>

            <form id="authForm" class="pairing-form" onsubmit="return false;">
              <input type="hidden" id="sessionId" value="${sessionId}">

              <!-- QR Code Authentication -->
              <div class="form-group">
                <label class="form-label"><i class="fas fa-qrcode"></i> Method 1: Quick QR Scan</label>
                ${qrImage ? `
                  <div class="qr-display">
                    <img src="${qrImage}" alt="WhatsApp QR Code" style="max-width: 100%; height: auto;">
                  </div>
                  <button type="button" class="btn btn-secondary" onclick="location.href='/session?sid=${sessionId}'" style="width: 100%; margin-top: 12px; padding: 12px;">
                    <i class="fas fa-sync-alt"></i> Refresh QR
                  </button>
                  <p style="color: var(--muted-text); margin-top: 10px; font-size: 0.85em; text-align: center;">
                    Auto-refreshes every 30 seconds
                  </p>
                ` : `
                  <div class="qr-display">
                    <div class="qr-loading">
                      <p style="margin-bottom: 12px; font-size: 1.1em;">
                        <i class="fas fa-spinner fa-spin" style="color: #667eea;"></i> Generating QR Code
                      </p>
                      <p style="font-size: 0.9em; color: #999;">The bot is initializing...</p>
                    </div>
                  </div>
                  <button type="button" class="btn btn-secondary" onclick="location.href='/session?sid=${sessionId}'" style="width: 100%; margin-top: 12px; padding: 12px;">
                    <i class="fas fa-redo"></i> Try Again
                  </button>
                `}

                <div class="instructions">
                  <strong style="color: #45b7d1;"><i class="fas fa-info-circle"></i> Quick Steps:</strong>
                  <ol>
                    <li>Open <strong>WhatsApp</strong> on your phone</li>
                    <li>Go to <strong>Settings → Linked Devices</strong></li>
                    <li>Tap <strong>Link a Device</strong></li>
                    <li>Point your phone at this QR code</li>
                  </ol>
                </div>
              </div>

              <!-- Divider -->
              <div style="margin: 25px 0; border-top: 2px solid var(--dark-border); opacity: 0.3;"></div>

              <!-- Pairing Code Authentication -->
              <div class="form-group">
                <label class="form-label"><i class="fas fa-phone"></i> Method 2: Pairing Code</label>
                <div style="background: var(--dark-bg); padding: 16px; border-radius: 12px; border-left: 4px solid #45b7d1; margin-bottom: 12px;">
                  <small style="color: var(--muted-text); display: block; line-height: 1.6;">
                    <i class="fas fa-lightbulb" style="margin-right: 6px; color: #fbbf24;"></i>
                    Alternative if QR code doesn't work. Works with linked devices feature.
                  </small>
                </div>

                <input 
                  type="tel" 
                  id="phoneNumber" 
                  class="form-input" 
                  placeholder="254721881604" 
                  maxlength="15"
                  onkeypress="if(event.key==='Enter') generatePairingCode()"
                  autocomplete="off"
                >
                <small style="color: var(--muted-text);">
                  <i class="fas fa-globe"></i> Phone number with country code (digits only, 10-15 digits)
                </small>
              </div>

              <!-- Generated Code Display -->
              <div class="form-group">
                <label class="form-label"><i class="fas fa-hashtag"></i> Your Pairing Code</label>
                <div class="code-display" onclick="copyToClipboard()" title="Click to copy">
                  <span id="pairingCode" class="code-placeholder">
                    <i class="fas fa-arrow-up"></i> Generate code above
                  </span>
                </div>
                <small style="color: var(--muted-text); text-align: center; display: block; margin-top: 8px;">
                  <i class="fas fa-clock"></i> Valid for 60 seconds • Click to copy
                </small>
              </div>

              <!-- Action Buttons -->
              <button type="button" class="btn btn-primary" onclick="generatePairingCode()" style="width: 100%; padding: 14px; font-size: 1em; margin-bottom: 8px;">
                <i class="fas fa-bolt"></i> Generate Pairing Code
              </button>

              <!-- Status Message -->
              <div id="statusMessage" class="status"></div>

              <!-- Instructions -->
              <div class="instructions" style="margin-top: 20px;">
                <strong style="color: #45b7d1;"><i class="fas fa-book-open"></i> Using Pairing Code:</strong>
                <ol>
                  <li>Enter your WhatsApp phone number above</li>
                  <li>Click <strong>Generate Pairing Code</strong></li>
                  <li>Open WhatsApp → <strong>Settings → Linked Devices → Link with Phone Number</strong></li>
                  <li>Enter the 8-digit code within 60 seconds</li>
                  <li>Your device will be linked immediately</li>
                </ol>
              </div>
            </form>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><i class="fas fa-rocket"></i> ${config.bot.name} v${config.bot.version} • Powered by Baileys</p>
          <p style="margin-top: 12px;">
            <a href="https://github.com/Fellix-234/VenomBot-Tech" target="_blank">
              <i class="fas fa-code-branch"></i> View Source
            </a> • 
            <a href="/" style="margin-left: 10px;">
              <i class="fas fa-home"></i> Home
            </a>
          </p>
        </div>
      </div>

      <script>
        // ===== Theme Toggle =====
        function toggleTheme() {
          document.body.classList.toggle('light-mode');
          const isLight = document.body.classList.contains('light-mode');
          const icon = document.getElementById('themeIcon');
          icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
          localStorage.setItem('theme-mode', isLight ? 'light' : 'dark');
        }

        // Load saved theme on page load
        window.addEventListener('DOMContentLoaded', () => {
          const savedTheme = localStorage.getItem('theme-mode');
          if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            document.getElementById('themeIcon').className = 'fas fa-sun';
          }
          createParticles();
        });

        // ===== Particles Animation =====
        function createParticles() {
          const container = document.getElementById('particlesContainer');
          if (!container) return;
          
          const particleCount = window.innerWidth > 768 ? 20 : 10;
          
          for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = (Math.random() * 4 + 2) + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.background = ['#667eea', '#764ba2', '#f093fb', '#4ecdc4'][Math.floor(Math.random() * 4)];
            particle.style.borderRadius = '50%';
            particle.style.animationDelay = (Math.random() * 3) + 's';
            container.appendChild(particle);
          }
        }

        // ===== Pairing Code Generation =====
        async function generatePairingCode() {
          const sessionId = document.getElementById('sessionId').value.trim();
          const phoneNumber = document.getElementById('phoneNumber').value.trim();
          
          // Validation
          if (!phoneNumber) {
            showStatus('❌ Please enter a phone number', 'error');
            return;
          }

          if (!/^\d{10,15}\$/.test(phoneNumber)) {
            showStatus('❌ Invalid format. Use digits only (10-15 with country code)', 'error');
            return;
          }

          const button = event.target;
          const originalHTML = button.innerHTML;
          button.disabled = true;
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

          try {
            const response = await fetch('/api/pairing-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber, sessionId })
            });

            const data = await response.json();
            button.disabled = false;
            button.innerHTML = originalHTML;

            if (data.success && data.code) {
              const code = String(data.code).trim();
              document.getElementById('pairingCode').textContent = code;
              document.getElementById('pairingCode').classList.remove('code-placeholder');
              
              showStatus('✅ Code ready! ' + code + ' - Valid for 60 seconds. Enter in your WhatsApp!', 'success');
              
              // Copy notification
              setTimeout(() => {
                showStatus('💡 Tip: Click the code to copy it', 'success');
              }, 2000);
              
              startCodeTimer();
            } else {
              showStatus('❌ ' + (data.error || 'Failed to generate code'), 'error');
            }
          } catch (error) {
            button.disabled = false;
            button.innerHTML = originalHTML;
            console.error('Pairing code error:', error);
            
            let errorMsg = error.message;
            if (errorMsg.includes('timeout')) {
              errorMsg = 'Connection timeout. Please try again.';
            } else if (errorMsg.includes('not supported')) {
              errorMsg = 'Feature not available. Use QR code instead.';
            }
            
            showStatus('❌ ' + errorMsg, 'error');
          }
        }

        // ===== Copy to Clipboard =====
        function copyToClipboard() {
          const code = document.getElementById('pairingCode').textContent;
          
          if (code.includes('Generate') || code.includes('Code')) {
            return;
          }
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
              showStatus('✅ Code copied to clipboard!', 'success');
            }).catch(() => {
              fallbackCopy(code);
            });
          } else {
            fallbackCopy(code);
          }
        }

        function fallbackCopy(text) {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showStatus('✅ Code copied!', 'success');
        }

        // ===== Status Messages =====
        function showStatus(message, type) {
          const status = document.getElementById('statusMessage');
          status.innerHTML = message;
          status.className = 'status show ' + type;
          
          const duration = type === 'success' ? 8000 : 5000;
          setTimeout(() => {
            status.classList.remove('show');
          }, duration);
        }

        // ===== Code Timer =====
        let codeTimer;
        function startCodeTimer() {
          clearTimeout(codeTimer);
          codeTimer = setTimeout(() => {
            const codeEl = document.getElementById('pairingCode');
            codeEl.textContent = 'Code expired';
            codeEl.classList.add('code-placeholder');
            showStatus('⏰ Pairing code expired. Generate a new one.', 'error');
          }, 60000);
        }

        // ===== Auto-refresh QR =====
        setTimeout(() => {
          const sid = document.getElementById('sessionId').value;
          location.href = '/session?sid=' + encodeURIComponent(sid);
        }, 30000);

        // ===== Keyboard Shortcuts =====
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && document.activeElement.id === 'phoneNumber') {
            generatePairingCode();
          }
          if (e.ctrlKey && e.key === 'c') {
            const code = document.getElementById('pairingCode').textContent;
            if (!code.includes('Generate') && !code.includes('Code')) {
              e.preventDefault();
              copyToClipboard();
            }
          }
        });

        // ===== Prevent Code Text Selection Issues =====
        document.getElementById('pairingCode').addEventListener('click', copyToClipboard);
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
