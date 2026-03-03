import chalk from 'chalk';
import express from 'express';
import QRCode from 'qrcode';
import { config } from './src/config.js';
import { logger } from './src/utils/logger.js';
import { connectToWhatsApp } from './src/modules/connection.js';
import {
  generateSessionId,
  createSession,
  getSession,
  getSessionStatus,
  getSessionQR,
  requestPairingCodeForSession,
  cleanupSession,
  cleanupAllSessions,
  resetSessionTimeoutExternal,
  getSessionTTL,
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

    // Validate phone number format - accept both with and without country code
    const cleanedPhone = phoneNumber.toString().replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format (use 10-15 digits including country code)'
      });
    }

    // Make sure session exists
    let sessionData = getSession(sessionId);
    if (!sessionData) {
      logger.info(`Creating new session for pairing code: ${sessionId}`);
      await createSession(sessionId);
      sessionData = getSession(sessionId);
    }

    logger.info(`📱 Requesting pairing code for session ${sessionId}: ${cleanedPhone}`);

    // Add request timeout (40 seconds - gives Baileys time to process)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Pairing code request timeout - WhatsApp server not responding. Try again.')), 40000)
    );

    try {
      const pairingPromise = requestPairingCodeForSession(sessionId, phoneNumber);
      const pairingCode = await Promise.race([pairingPromise, timeoutPromise]);

      logger.success(`Pairing code generated: ${pairingCode}`);

      res.json({
        success: true,
        code: pairingCode,
        message: 'Pairing code generated successfully. Code expires in 60 seconds.',
        expiresIn: 60
      });
    } catch (timeoutError) {
      throw new Error(timeoutError.message || 'Pairing code request timeout');
    }
  } catch (error) {
    logger.error('Pairing code error:', error.message);

    let userError = error.message;
    let statusCode = 500;

    // User-friendly error messages
    if (error.message.includes('already connected')) {
      userError = 'Session already connected. Cannot generate pairing code.';
      statusCode = 400;
    } else if (error.message.includes('Invalid phone')) {
      userError = 'Invalid phone number. Must be 10-15 digits with country code.';
      statusCode = 400;
    } else if (error.message.includes('Socket not ready')) {
      userError = 'Socket not ready. Please wait a moment and try again.';
      statusCode = 503;
    } else if (error.message.includes('not available') || error.message.includes('not function')) {
      userError = 'Pairing code feature unavailable. Please use QR code scan method instead.';
      statusCode = 503;
    } else if (error.message.includes('timeout')) {
      userError = 'Request timed out. Please check your internet connection and try again.';
      statusCode = 504;
    } else if (error.message.includes('Baileys')) {
      userError = 'Baileys library issue. Try using QR code method instead.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: userError,
      debug: process.env.DEBUG === 'true' ? error.message : undefined
    });
  }
});

// API endpoint to get QR code directly
app.get('/api/qr', async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Create session if doesn't exist
    let sessionData = getSession(sessionId);
    if (!sessionData) {
      logger.info(`Creating new session for QR: ${sessionId}`);
      await createSession(sessionId);
      sessionData = getSession(sessionId);
    }

    if (!sessionData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create session'
      });
    }

    const qrData = sessionData.qr;

    if (!qrData) {
      // QR not ready yet - return status to indicate waiting
      return res.json({
        success: true,
        qr: null,
        waiting: true,
        message: 'QR code not ready yet, please wait...',
        sessionStatus: {
          connected: sessionData.connected,
          lastActivity: sessionData.lastActivity
        }
      });
    }

    // Generate QR code image from the string
    let qrImage = null;
    try {
      qrImage = await QRCode.toDataURL(qrData, {
        width: 350,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      logger.error('QR generation error:', qrError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate QR image: ' + qrError.message
      });
    }

    res.json({
      success: true,
      qr: qrImage,
      qrRaw: qrData,
      waiting: false
    });
  } catch (error) {
    logger.error('QR endpoint error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
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

    // If session exists but QR is not ready, try to get it
    if (status.exists && !status.qr && !status.connected) {
      const session = getSession(sessionId);
      if (session && session.qr) {
        status.qr = session.qr;
        status.qrUpdatedAt = session.qrUpdatedAt;
      }
    }

    res.json({
      success: true,
      status: status.connected ? 'connected' : (status.qr ? 'waiting_for_scan' : 'waiting_for_qr'),
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

// API endpoint to keep session alive (heartbeat)
app.post('/api/heartbeat', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = getSession(sessionId);
    if (session) {
      // Update last activity
      session.lastActivity = Date.now();

      // Reset the session timeout to keep it alive
      resetSessionTimeoutExternal(sessionId);

      res.json({
        success: true,
        message: 'Heartbeat received, session extended'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
          background: radial-gradient(circle at top right, #1e293b, #0f172a);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #f1f5f9;
          transition: background 0.4s ease;
          overflow-x: hidden;
        }

        body.light-mode {
          background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
          color: #1e293b;
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
          margin-bottom: 50px;
          animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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
          50% { transform: translateY(-10px); }
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
          font-size: 1.1em;
          color: #94a3b8;
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
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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

        .btn-whatsapp {
          background: #25d366;
          color: white;
          border: none;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
        }

        .btn-whatsapp:hover {
          background: #20ba61;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
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

        /* Confetti Animation */
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #f0f;
          position: fixed;
          top: -10px;
          z-index: 9999;
          animation: confetti-fall 3s linear forwards;
          pointer-events: none;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Tooltip Styles */
        .tooltip {
          position: relative;
          display: inline-block;
        }

        .tooltip .tooltiptext {
          visibility: hidden;
          width: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          border-radius: 8px;
          padding: 8px;
          position: absolute;
          z-index: 1000;
          bottom: 125%;
          left: 50%;
          margin-left: -90px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.85em;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }

        /* Progress Bar for Timer */
        .timer-progress {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 8px;
        }

        .timer-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4ecdc4 0%, #ff6b6b 100%);
          width: 100%;
          transition: width 1s linear;
        }

        /* Connection Status Indicator */
        .status-indicator {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 16px;
          border-radius: 50px;
          backdrop-filter: blur(10px);
          font-size: 0.85em;
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        body.light-mode .status-indicator {
          background: rgba(255, 255, 255, 0.9);
          color: #1f2937;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        .status-dot.connected {
          background: #4ecdc4;
        }

        .status-dot.disconnected {
          background: #ff6b6b;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        /* Help Modal */
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s;
        }

        .modal.show {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: var(--dark-card);
          border: 1px solid var(--dark-border);
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        body.light-mode .modal-content {
          background: white;
          border-color: var(--light-border);
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .modal-title {
          font-size: 1.8em;
          font-weight: 700;
          color: var(--light-text);
        }

        body.light-mode .modal-title {
          color: #1f2937;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 2em;
          color: var(--muted-text);
          cursor: pointer;
          transition: all 0.3s;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .modal-close:hover {
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
          transform: rotate(90deg);
        }

        .help-icon {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 55px;
          height: 55px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          transition: all 0.3s;
          z-index: 100;
          animation: bounce-help 3s infinite;
        }

        .help-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.7);
        }

        @keyframes bounce-help {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Download Button */
        .download-qr-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .download-qr-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        /* Copy Animation */
        @keyframes copy-success {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .copy-success {
          animation: copy-success 0.3s ease-out;
        }

        /* Skeleton Loader */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        body.light-mode .skeleton {
          background: linear-gradient(90deg, #f9fafb 25%, #f3f4f6 50%, #f9fafb 75%);
          background-size: 200% 100%;
        }

        /* Session Info Box */
        .session-info {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          border-left: 4px solid #667eea;
          font-size: 0.9em;
        }

        body.light-mode .session-info {
          background: rgba(102, 126, 234, 0.05);
        }

        .session-info strong {
          color: #667eea;
          display: block;
          margin-bottom: 8px;
        }

        .session-id-badge {
          background: var(--dark-bg);
          padding: 6px 12px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          display: inline-block;
          margin-top: 6px;
          color: #4ecdc4;
        }

        body.light-mode .session-id-badge {
          background: #f3f4f6;
          color: #667eea;
        }

        /* Step Progress Indicator */
        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 30px 0;
          position: relative;
          padding: 0 20px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--dark-bg);
          border: 3px solid var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3em;
          color: var(--muted-text);
          transition: all 0.4s ease;
        }

        body.light-mode .step-circle {
          background: white;
          border-color: var(--light-border);
        }

        .step-circle.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
          transform: scale(1.1);
        }

        .step-circle.completed {
          background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
          border-color: #4ecdc4;
          color: white;
        }

        .step-label {
          font-size: 0.75em;
          color: var(--muted-text);
          text-align: center;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .step-circle.active + .step-label {
          color: #667eea;
        }

        .step-circle.completed + .step-label {
          color: #4ecdc4;
        }

        .progress-line {
          position: absolute;
          top: 25px;
          left: 20px;
          right: 20px;
          height: 3px;
          background: var(--dark-border);
          z-index: 1;
        }

        body.light-mode .progress-line {
          background: var(--light-border);
        }

        .progress-line-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #4ecdc4 100%);
          width: 0%;
          transition: width 0.6s ease;
        }

        /* QR Scan Detector Animation */
        .qr-scanner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 2;
        }

        .scan-line {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4ecdc4, transparent);
          box-shadow: 0 0 10px #4ecdc4;
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }

        .scan-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #4ecdc4;
        }

        .scan-corner.top-left {
          top: 10%;
          left: 10%;
          border-right: none;
          border-bottom: none;
        }

        .scan-corner.top-right {
          top: 10%;
          right: 10%;
          border-left: none;
          border-bottom: none;
        }

        .scan-corner.bottom-left {
          bottom: 10%;
          left: 10%;
          border-right: none;
          border-top: none;
        }

        .scan-corner.bottom-right {
          bottom: 10%;
          right: 10%;
          border-left: none;
          border-top: none;
        }

        /* Success Screen */
        .success-screen {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.95) 0%, rgba(69, 183, 209, 0.95) 100%);
          z-index: 2000;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.5s ease-out;
        }

        .success-screen.show {
          display: flex;
        }

        .success-content {
          text-align: center;
          color: white;
          animation: scaleIn 0.6s ease-out;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-icon {
          font-size: 8em;
          margin-bottom: 30px;
          animation: bounce 1s infinite;
        }

        .success-title {
          font-size: 3.5em;
          font-weight: 700;
          margin-bottom: 20px;
          text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .success-message {
          font-size: 1.4em;
          opacity: 0.95;
          margin-bottom: 30px;
        }

        .success-details {
          background: rgba(255, 255, 255, 0.2);
          padding: 20px 40px;
          border-radius: 15px;
          display: inline-block;
          backdrop-filter: blur(10px);
          margin-top: 20px;
        }

        .success-detail-item {
          margin: 10px 0;
          font-size: 1.1em;
        }

        /* Device Info Display */
        .device-info {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          border: 1px solid var(--dark-border);
        }

        body.light-mode .device-info {
          background: rgba(102, 126, 234, 0.05);
          border-color: var(--light-border);
        }

        .device-info-title {
          font-size: 1.1em;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .device-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .device-info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .device-info-label {
          font-size: 0.75em;
          color: var(--muted-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .device-info-value {
          font-size: 0.9em;
          color: var(--light-text);
          font-weight: 500;
        }

        body.light-mode .device-info-value {
          color: #1f2937;
        }

        /* Pulse Animation for Active Elements */
        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        /* Badge Styles */
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-success {
          background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
          color: white;
        }

        .badge-warning {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #333;
        }

        .badge-info {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        /* ===== Toast Notifications ===== */
        .toast-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 5000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast {
          background: var(--dark-card);
          border: 1px solid var(--dark-border);
          border-radius: 12px;
          padding: 16px 20px;
          min-width: 250px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideInRight 0.4s ease-out;
          pointer-events: all;
          backdrop-filter: blur(10px);
          color: var(--light-text);
        }

        body.light-mode .toast {
          background: white;
          border-color: var(--light-border);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          color: #1f2937;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        .toast.remove {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        .toast-icon {
          font-size: 1.4em;
          min-width: 30px;
        }

        .toast.success .toast-icon { color: #4ecdc4; }
        .toast.error .toast-icon { color: #ff6b6b; }
        .toast.info .toast-icon { color: #667eea; }
        .toast.warning .toast-icon { color: #fbbf24; }

        /* ===== Activity Log ===== */
        .activity-log {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border: 1px solid var(--dark-border);
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          max-height: 300px;
          overflow-y: auto;
        }

        body.light-mode .activity-log {
          background: rgba(102, 126, 234, 0.02);
          border-color: var(--light-border);
        }

        .activity-log-title {
          font-size: 1.1em;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--dark-border);
          align-items: flex-start;
          font-size: 0.9em;
        }

        body.light-mode .activity-item {
          border-bottom-color: var(--light-border);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          min-width: 24px;
          font-size: 1.1em;
          margin-top: 2px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-action {
          color: var(--light-text);
          font-weight: 500;
        }

        body.light-mode .activity-action {
          color: #1f2937;
        }

        .activity-time {
          color: var(--muted-text);
          font-size: 0.85em;
          margin-top: 2px;
        }

        /* ===== Session Timer ===== */
        .session-timer {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9em;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        /* ===== Security Tips Drawer ===== */
        .tips-drawer {
          position: fixed;
          right: -350px;
          top: 0;
          width: 350px;
          height: 100vh;
          background: var(--dark-card);
          border-left: 2px solid var(--dark-border);
          z-index: 999;
          overflow-y: auto;
          transition: right 0.4s ease;
          box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
        }

        body.light-mode .tips-drawer {
          background: white;
          border-left-color: var(--light-border);
        }

        .tips-drawer.open {
          right: 0;
        }

        .tips-drawer-header {
          padding: 20px;
          border-bottom: 1px solid var(--dark-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: var(--dark-card);
          z-index: 10;
        }

        body.light-mode .tips-drawer-header {
          background: white;
          border-bottom-color: var(--light-border);
        }

        .tips-drawer-title {
          font-size: 1.3em;
          font-weight: 700;
          color: var(--light-text);
        }

        .tips-drawer-close {
          background: transparent;
          border: none;
          color: var(--muted-text);
          font-size: 1.5em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tips-drawer-close:hover {
          transform: rotate(90deg);
          color: #ff6b6b;
        }

        .tips-content {
          padding: 20px;
        }

        .tip-item {
          margin-bottom: 20px;
          padding: 15px;
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(69, 183, 209, 0.1) 100%);
          border-left: 4px solid #4ecdc4;
          border-radius: 8px;
        }

        body.light-mode .tip-item {
          background: rgba(102, 126, 234, 0.08);
          border-left-color: #667eea;
        }

        .tip-title {
          font-weight: 600;
          color: #4ecdc4;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        body.light-mode .tip-title {
          color: #667eea;
        }

        .tip-text {
          color: var(--muted-text);
          font-size: 0.9em;
          line-height: 1.5;
        }

        /* ===== Troubleshooting ===== */
        .troubleshoot-btn {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9em;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
        }

        .troubleshoot-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
        }

        .troubleshoot-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 3000;
          align-items: center;
          justify-content: center;
        }

        .troubleshoot-modal.show {
          display: flex;
        }

        .troubleshoot-content {
          background: var(--dark-card);
          border: 1px solid var(--dark-border);
          border-radius: 20px;
          padding: 40px;
          max-width: 700px;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        body.light-mode .troubleshoot-content {
          background: white;
          border-color: var(--light-border);
        }

        .trouble-item {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--dark-border);
        }

        body.light-mode .trouble-item {
          border-bottom-color: var(--light-border);
        }

        .trouble-item:last-child {
          border-bottom: none;
        }

        .trouble-q {
          font-weight: 600;
          color: #f093fb;
          margin-bottom: 8px;
          font-size: 0.95em;
        }

        .trouble-a {
          color: var(--muted-text);
          font-size: 0.9em;
          line-height: 1.6;
          margin-left: 15px;
        }

        /* ===== Stats Dashboard ===== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 15px;
        }

        .stat-card {
          background: linear-gradient(135deg, var(--dark-bg) 0%, var(--dark-card) 100%);
          border: 1px solid var(--dark-border);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          transition: all 0.3s;
        }

        body.light-mode .stat-card {
          background: rgba(102, 126, 234, 0.05);
          border-color: var(--light-border);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .stat-value {
          font-size: 1.6em;
          font-weight: 700;
          color: #667eea;
          display: block;
        }

        .stat-label {
          font-size: 0.75em;
          color: var(--muted-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        /* ===== Floating Action Buttons ===== */
        .fab-menu {
          position: fixed;
          bottom: 30px;
          left: 30px;
          z-index: 99;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }

        .fab {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .fab:hover {
          transform: scale(1.15);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .fab.tips {
          background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
        }

        .fab.tip-label {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85em;
          white-space: nowrap;
        }

        /* ===== Accessibility */
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

        /* Mobile Responsiveness for New Features */
        @media (max-width: 768px) {
          .progress-steps {
            padding: 0 10px;
          }

          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 1.1em;
          }

          .step-label {
            font-size: 0.65em;
          }

          .success-icon {
            font-size: 5em;
          }

          .success-title {
            font-size: 2.2em;
          }

          .success-message {
            font-size: 1.1em;
          }

          .device-info-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <!-- Toast Notification Container -->
      <div id="toastContainer" class="toast-container"></div>

      <!-- Tips Drawer -->
      <div id="tipsDrawer" class="tips-drawer">
        <div class="tips-drawer-header">
          <div class="tips-drawer-title"><i class="fas fa-lightbulb"></i> Security Tips</div>
          <button class="tips-drawer-close" onclick="toggleTipsDrawer()">×</button>
        </div>
        <div class="tips-content">
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-lock"></i> Never Share Session ID</div>
            <div class="tip-text">Your session ID is like a password. Keep it private and never share it with anyone.</div>
          </div>
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-qrcode"></i> QR Code Safety</div>
            <div class="tip-text">Only scan QR codes from trusted sources. Never screenshot and share QR codes.</div>
          </div>
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-shield-alt"></i> Connection Security</div>
            <div class="tip-text">Always use HTTPS connections. This page is secured with encryption.</div>
          </div>
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-clock"></i> Session Expiry</div>
            <div class="tip-text">Sessions expire for security. Generate a new session if your code expires.</div>
          </div>
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-exclamation-triangle"></i> Suspicious Activity</div>
            <div class="tip-text">If you notice unusual activity, clear the session and start fresh.</div>
          </div>
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-mobile-alt"></i> Device Security</div>
            <div class="tip-text">Keep your phone charger disconnected while in sensitive areas.</div>
          </div>
          <div class="tip-item">
            <div class="tip-title"><i class="fas fa-check-circle"></i> Best Practices</div>
            <div class="tip-text">Always verify the session details after connecting. Use strong passwords.</div>
          </div>
        </div>
      </div>

      <!-- Troubleshooting Modal -->
      <div id="troubleshootModal" class="troubleshoot-modal">
        <div class="troubleshoot-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h2 style="color: #667eea; font-size: 1.8em;"><i class="fas fa-wrench"></i> Troubleshooting Guide</h2>
            <button onclick="toggleTroubleshoot()" style="background: transparent; border: none; font-size: 1.8em; cursor: pointer; color: #667eea;">×</button>
          </div>
          
          <div class="trouble-item">
            <div class="trouble-q"><i class="fas fa-question-circle"></i> QR Code Not Working?</div>
            <div class="trouble-a">
              • Check if your WhatsApp is updated to the latest version<br>
              • Make sure you have a stable internet connection<br>
              • Try refreshing the QR code by clicking the Refresh button<br>
              • Use Method 2 (Pairing Code) if QR continues to fail
            </div>
          </div>

          <div class="trouble-item">
            <div class="trouble-q"><i class="fas fa-question-circle"></i> Pairing Code Expired?</div>
            <div class="trouble-a">
              • Pairing codes are only valid for 60 seconds<br>
              • Generate a new code immediately when you're ready<br>
              • Enter the code within 60 seconds in WhatsApp<br>
              • If time runs out, the code will expire and you need a new one
            </div>
          </div>

          <div class="trouble-item">
            <div class="trouble-q"><i class="fas fa-question-circle"></i> Session ID Not Copying?</div>
            <div class="trouble-a">
              • Click directly on the Session ID badge<br>
              • Check if your browser allows clipboard access<br>
              • If using old browser, enable clipboard permissions<br>
              • Manually select and copy the session ID
            </div>
          </div>

          <div class="trouble-item">
            <div class="trouble-q"><i class="fas fa-question-circle"></i> Connection Keeps Failing?</div>
            <div class="trouble-a">
              • Ensure your internet connection is stable<br>
              • Try clearing browser cache and cookies<br>
              • Disconnect and reconnect to WiFi<br>
              • Try using mobile data instead of WiFi<br>
              • Contact support if issue persists
            </div>
          </div>

          <div class="trouble-item">
            <div class="trouble-q"><i class="fas fa-question-circle"></i> Page Not Loading?</div>
            <div class="trouble-a">
              • Refresh the page (Ctrl+R or Cmd+R)<br>
              • Clear browser cache (Ctrl+Shift+Delete)<br>
              • Try a different browser (Chrome, Edge, Safari)<br>
              • Disable browser extensions and try again
            </div>
          </div>

          <div class="trouble-item">
            <div class="trouble-q"><i class="fas fa-question-circle"></i> Getting Error Messages?</div>
            <div class="trouble-a">
              • Note the error message and error code<br>
              • Try the action again after a few seconds<br>
              • Check WhatsApp is not open on your phone<br>
              • Generate a new session and try again
            </div>
          </div>
        </div>
      </div>

      <!-- FAB Menu -->
      <div class="fab-menu">
        <button class="fab tips" onclick="toggleTipsDrawer()" title="Security Tips">
          <i class="fas fa-bulb"></i>
        </button>
        <button class="fab" onclick="toggleTroubleshoot()" title="Troubleshooting">
          <i class="fas fa-wrench"></i>
        </button>
      </div>

      <!-- Particles Background -->
      <div class="particles" id="particlesContainer"></div>

      <!-- Connection Status Indicator -->
      <div class="status-indicator">
        <div class="status-dot connected" id="statusDot"></div>
        <span id="statusText">Connected</span>
      </div>

      <!-- Theme Toggle Button -->
      <button class="theme-toggle tooltip" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
        <i class="fas fa-moon" id="themeIcon"></i>
        <span class="tooltiptext">Switch Theme</span>
      </button>

      <!-- Help Button -->
      <div class="help-icon tooltip" onclick="toggleHelpModal()">
        <i class="fas fa-question"></i>
        <span class="tooltiptext">Need Help?</span>
      </div>

      <!-- Help Modal -->
      <div id="helpModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title"><i class="fas fa-info-circle"></i> How to Connect</h2>
            <button class="modal-close" onclick="toggleHelpModal()">×</button>
          </div>
          <div style="line-height: 1.8; color: var(--muted-text);">
            <h3 style="color: #667eea; margin-top: 20px;"><i class="fas fa-qrcode"></i> Method 1: QR Code (Recommended)</h3>
            <ol style="margin-left: 20px; margin-top: 10px;">
              <li>Open WhatsApp on your phone</li>
              <li>Tap <strong>Menu</strong> or <strong>Settings</strong></li>
              <li>Select <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link a Device</strong></li>
              <li>Point your phone at the QR code on this page</li>
              <li>Wait for confirmation</li>
            </ol>

            <h3 style="color: #667eea; margin-top: 25px;"><i class="fas fa-mobile-alt"></i> Method 2: Pairing Code</h3>
            <ol style="margin-left: 20px; margin-top: 10px;">
              <li>Enter your WhatsApp phone number with country code</li>
              <li>Click <strong>Generate Pairing Code</strong></li>
              <li>Open WhatsApp → <strong>Settings</strong> → <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link with Phone Number</strong> instead</li>
              <li>Enter the 8-digit code shown on this page</li>
              <li>Code expires in 60 seconds</li>
            </ol>

            <h3 style="color: #667eea; margin-top: 25px;"><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
            <ul style="margin-left: 20px; margin-top: 10px; list-style: none;">
              <li><kbd style="background: var(--dark-bg); padding: 2px 8px; border-radius: 4px; font-size: 0.9em;">Enter</kbd> - Generate pairing code</li>
              <li><kbd style="background: var(--dark-bg); padding: 2px 8px; border-radius: 4px; font-size: 0.9em;">Ctrl+C</kbd> - Copy code to clipboard</li>
            </ul>

            <div style="background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(69, 183, 209, 0.1) 100%); padding: 15px; border-radius: 10px; margin-top: 25px; border-left: 4px solid #4ecdc4;">
              <strong style="color: #4ecdc4;"><i class="fas fa-lightbulb"></i> Pro Tips:</strong>
              <ul style="margin-left: 20px; margin-top: 8px;">
                <li>Click the pairing code to copy it instantly</li>
                <li>Download QR code for offline use</li>
                <li>QR refreshes automatically if not scanned</li>
                <li>Use dark mode for better viewing at night</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Screen Overlay -->
      <div id="successScreen" class="success-screen">
        <div class="success-content">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2 class="success-title">🎉 Connected Successfully!</h2>
          <p class="success-message">Your WhatsApp session is now active</p>
          <div class="success-details">
            <div class="success-detail-item">
              <i class="fas fa-robot"></i> <strong>Bot:</strong> ${config.bot.name}
            </div>
            <div class="success-detail-item">
              <i class="fas fa-fingerprint"></i> <strong>Session ID:</strong> <span id="successSessionId">${sessionId}</span>
            </div>
            <div class="success-detail-item">
              <i class="fas fa-clock"></i> <strong>Connected at:</strong> <span id="successTime"></span>
            </div>
          </div>
          <p style="margin-top: 25px; font-size: 1em; opacity: 0.9;">
            <i class="fas fa-info-circle"></i> You can now close this page and use WhatsApp normally
          </p>
        </div>
      </div>

      <div class="container">
        <!-- Progress Steps Indicator -->
        <div class="progress-steps">
          <div class="progress-line">
            <div class="progress-line-fill" id="progressLineFill"></div>
          </div>
          <div class="progress-step">
            <div class="step-circle active" id="step1">
              <i class="fas fa-fingerprint"></i>
            </div>
            <div class="step-label">Session</div>
          </div>
          <div class="progress-step">
            <div class="step-circle" id="step2">
              <i class="fas fa-qrcode"></i>
            </div>
            <div class="step-label">Scan/Code</div>
          </div>
          <div class="progress-step">
            <div class="step-circle" id="step3">
              <i class="fas fa-link"></i>
            </div>
            <div class="step-label">Connect</div>
          </div>
          <div class="progress-step">
            <div class="step-circle" id="step4">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="step-label">Complete</div>
          </div>
        </div>

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

            <!-- Session Info -->
            <div class="session-info">
              <strong><i class="fas fa-fingerprint"></i> Your Session ID:</strong>
              <div class="session-id-badge" onclick="copySessionId()" style="cursor: pointer;" title="Click to copy">
                ${sessionId}
              </div>
              <small style="display: block; margin-top: 8px; color: var(--muted-text);">
                <i class="fas fa-shield-alt"></i> This session is unique and secure. Keep it private.
              </small>
            </div>

            <!-- Device Info -->
            <div class="device-info">
              <div class="device-info-title">
                <i class="fas fa-laptop"></i> Device Information
                <span class="badge badge-info">LIVE</span>
              </div>
              <div class="device-info-grid">
                <div class="device-info-item">
                  <span class="device-info-label">Browser</span>
                  <span class="device-info-value" id="deviceBrowser">Detecting...</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-label">Platform</span>
                  <span class="device-info-value" id="devicePlatform">Detecting...</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-label">Screen</span>
                  <span class="device-info-value" id="deviceScreen">Detecting...</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-label">Connection</span>
                  <span class="device-info-value">
                    <span class="badge badge-success" id="deviceConnection">Secure</span>
                  </span>
                </div>
              </div>
            </div>

            <form id="authForm" class="pairing-form" onsubmit="return false;">
              <input type="hidden" id="sessionId" value="${sessionId}">

              <!-- QR Code Authentication -->
              <div class="form-group">
                <label class="form-label"><i class="fas fa-qrcode"></i> Method 1: Quick QR Scan</label>
                ${qrImage ? `
                  <div class="qr-display" style="position: relative;">
                    <img src="${qrImage}" alt="WhatsApp QR Code" id="qrCodeImg" style="max-width: 100%; height: auto;">
                    <!-- QR Scanner Animation -->
                    <div class="qr-scanner">
                      <div class="scan-line"></div>
                      <div class="scan-corner top-left"></div>
                      <div class="scan-corner top-right"></div>
                      <div class="scan-corner bottom-left"></div>
                      <div class="scan-corner bottom-right"></div>
                    </div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                    <a href="https://web.whatsapp.com" target="_blank" class="btn btn-whatsapp" style="text-decoration: none;">
                      <i class="fab fa-whatsapp"></i> Link on WhatsApp Web
                    </a>
                    <div style="display: flex; gap: 10px;">
                      <button type="button" class="btn btn-secondary" onclick="refreshQR()" style="flex: 1; padding: 12px;">
                        <i class="fas fa-sync-alt"></i> Refresh
                      </button>
                      <button type="button" class="download-qr-btn tooltip" onclick="downloadQR()" style="flex: 1;">
                        <i class="fas fa-download"></i> Download
                        <span class="tooltiptext">Save QR for offline use</span>
                      </button>
                    </div>
                  </div>
                  <div id="qrTimer" style="margin-top: 12px;">
                    <p style="color: var(--muted-text); font-size: 0.85em; text-align: center; margin-bottom: 4px;">
                      <i class="fas fa-clock"></i> Auto-refresh in <span id="qrCountdown">30</span>s
                    </p>
                    <div class="timer-progress">
                      <div class="timer-progress-bar" id="qrProgressBar"></div>
                    </div>
                  </div>
                ` : `
                  <div class="qr-display">
                    <div class="qr-loading">
                      <p style="margin-bottom: 12px; font-size: 1.1em;">
                        <i class="fas fa-spinner fa-spin" style="color: #667eea;"></i> Generating QR Code
                      </p>
                      <p style="font-size: 0.9em; color: #999;">The bot is initializing...</p>
                      <div class="skeleton" style="width: 280px; height: 280px; margin: 20px auto;"></div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-secondary" onclick="refreshQR()" style="width: 100%; margin-top: 12px; padding: 12px;">
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
                <div class="code-display tooltip" onclick="copyToClipboard()" title="Click to copy">
                  <span id="pairingCode" class="code-placeholder">
                    <i class="fas fa-arrow-up"></i> Generate code above
                  </span>
                  <span class="tooltiptext">Click to copy code</span>
                </div>
                <div id="codeTimer" class="hidden" style="margin-top: 8px;">
                  <p style="color: var(--muted-text); text-align: center; font-size: 0.85em; margin-bottom: 4px;">
                    <i class="fas fa-hourglass-half"></i> Expires in <span id="codeCountdown">60</span>s
                  </p>
                  <div class="timer-progress">
                    <div class="timer-progress-bar" id="codeProgressBar"></div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <button type="button" class="btn btn-primary" onclick="generatePairingCode(this)" style="width: 100%; padding: 14px; font-size: 1em;">
                  <i class="fas fa-bolt"></i> Generate Pairing Code
                </button>
                <button type="button" id="openWhatsAppBtn" class="btn btn-whatsapp hidden" onclick="openWhatsApp()" style="width: 100%; padding: 14px; font-size: 1em;">
                  <i class="fab fa-whatsapp"></i> Open WhatsApp & Link
                </button>
              </div>

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

              <!-- Stats Dashboard -->
              <div style="margin-top: 25px;">
                <div style="font-size: 1.1em; font-weight: 600; color: #667eea; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-chart-bar"></i> Connection Statistics
                </div>
                <div class="stats-grid">
                  <div class="stat-card">
                    <span class="stat-value" id="statAttempts">0</span>
                    <div class="stat-label">Attempts</div>
                  </div>
                  <div class="stat-card">
                    <span class="stat-value" id="statSuccess">0</span>
                    <div class="stat-label">Success</div>
                  </div>
                  <div class="stat-card">
                    <span class="stat-value" id="statFailed">0</span>
                    <div class="stat-label">Failed</div>
                  </div>
                  <div class="stat-card">
                    <span class="stat-value" id="statRate">0%</span>
                    <div class="stat-label">Success Rate</div>
                  </div>
                </div>
              </div>

              <!-- Activity Log -->
              <div class="activity-log">
                <div class="activity-log-title">
                  <i class="fas fa-history"></i> Recent Activity
                </div>
                <div id="activityList">
                  <div class="activity-item" style="opacity: 0.6;">
                    <div class="activity-icon"><i class="fas fa-info-circle" style="color: #667eea;"></i></div>
                    <div class="activity-content">
                      <div class="activity-action">Session created</div>
                      <div class="activity-time">Just now</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Session Duration Timer -->
              <div style="margin-top: 20px; text-align: center;">
                <div class="session-timer" id="sessionTimer" style="display: none;">
                  <i class="fas fa-hourglass-start"></i>
                  <span>Session Duration: <span id="sessionDuration">00:00</span></span>
                </div>
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
        // ===== Global Variables =====
        let qrRefreshTimer;
        let qrCountdownInterval;
        let codeExpiryTimer;
        let codeCountdownInterval;
        let qrTimeLeft = 30;
        let codeTimeLeft = 60;
        let statusCheckInterval;
        let qrCheckInterval;
        let heartbeatInterval;
        let sessionStartTime;
        let sessionDurationInterval;
        let stats = {
          attempts: 0,
          success: 0,
          failed: 0
        };
        let activityLog = [];

        // ===== Toast Notification System =====
        function showToast(message, type = 'info', duration = 4000) {
          const container = document.getElementById('toastContainer');
          const toast = document.createElement('div');
          toast.className = 'toast ' + type;
          
          const icons = {
            success: '<i class="fas fa-check-circle toast-icon"></i>',
            error: '<i class="fas fa-exclamation-circle toast-icon"></i>',
            info: '<i class="fas fa-info-circle toast-icon"></i>',
            warning: '<i class="fas fa-exclamation-triangle toast-icon"></i>'
          };
          
          toast.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
          container.appendChild(toast);
          
          setTimeout(() => {
            toast.classList.add('remove');
            setTimeout(() => toast.remove(), 300);
          }, duration);
        }

        // ===== Activity Logger =====
        function logActivity(action, icon = 'fa-history') {
          const now = new Date();
          const timeStr = now.toLocaleTimeString();
          
          activityLog.unshift({
            action: action,
            time: timeStr,
            icon: icon
          });
          
          // Keep only last 10 activities
          if (activityLog.length > 10) {
            activityLog.pop();
          }
          
          updateActivityDisplay();
        }

        function updateActivityDisplay() {
          const activityList = document.getElementById('activityList');
          activityList.innerHTML = '';
          
          activityLog.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'activity-item';
            const html = '<div class="activity-icon"><i class="fas ' + item.icon + '"></i></div>' +
                        '<div class="activity-content">' +
                        '<div class="activity-action">' + item.action + '</div>' +
                        '<div class="activity-time">' + item.time + '</div>' +
                        '</div>';
            el.innerHTML = html;
            activityList.appendChild(el);
          });
        }

        // ===== Session Duration Timer =====
        function startSessionTimer() {
          sessionStartTime = new Date();
          document.getElementById('sessionTimer').style.display = 'inline-flex';
          
          sessionDurationInterval = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - sessionStartTime) / 1000);
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            
            const timeStr = [hours, minutes, seconds].map(x => String(x).padStart(2, '0')).join(':');
            document.getElementById('sessionDuration').textContent = timeStr;
          }, 1000);
        }

        // ===== Tips Drawer Toggle =====
        function toggleTipsDrawer() {
          const drawer = document.getElementById('tipsDrawer');
          drawer.classList.toggle('open');
        }

        // ===== Troubleshoot Modal Toggle =====
        function toggleTroubleshoot() {
          const modal = document.getElementById('troubleshootModal');
          modal.classList.toggle('show');
        }

        // Close troubleshoot modal when clicking outside
        document.addEventListener('click', function(event) {
          const modal = document.getElementById('troubleshootModal');
          if (event.target === modal) {
            modal.classList.remove('show');
          }
        });

        // ===== Stats Management =====
        function updateStats() {
          const total = stats.attempts;
          const rate = total > 0 ? Math.round((stats.success / total) * 100) : 0;
          
          document.getElementById('statAttempts').textContent = stats.attempts;
          document.getElementById('statSuccess').textContent = stats.success;
          document.getElementById('statFailed').textContent = stats.failed;
          document.getElementById('statRate').textContent = rate + '%';
        }

        function recordAttempt(success) {
          stats.attempts++;
          if (success) {
            stats.success++;
            logActivity('Connection successful', 'fa-check');
          } else {
            stats.failed++;
            logActivity('Connection failed', 'fa-times');
          }
          updateStats();
        }

        // ===== Success Sound Notification =====
        function playSuccessSound() {
          try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (e) {
            // Silent fail - audio context may not be available
          }
        }

        // ===== Theme Toggle =====
        function toggleTheme() {
          document.body.classList.toggle('light-mode');
          const isLight = document.body.classList.contains('light-mode');
          const icon = document.getElementById('themeIcon');
          icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
          localStorage.setItem('theme-mode', isLight ? 'light' : 'dark');
          createConfetti();
        }

        // ===== Help Modal =====
        function toggleHelpModal() {
          const modal = document.getElementById('helpModal');
          modal.classList.toggle('show');
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
          const modal = document.getElementById('helpModal');
          if (e.target === modal) {
            modal.classList.remove('show');
          }
        });

        // ===== Confetti Animation =====
        function createConfetti() {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f093fb', '#667eea'];
          for (let i = 0; i < 50; i++) {
            setTimeout(() => {
              const confetti = document.createElement('div');
              confetti.className = 'confetti';
              confetti.style.left = Math.random() * 100 + '%';
              confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
              confetti.style.animationDelay = Math.random() * 0.5 + 's';
              document.body.appendChild(confetti);
              
              setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
          }
        }

        // ===== Copy Session ID =====
        function copySessionId() {
          const sessionId = document.getElementById('sessionId').value;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sessionId).then(() => {
              showStatus('✅ Session ID copied to clipboard!', 'success');
              logActivity('Copied Session ID', 'fa-copy');
            });
          } else {
            fallbackCopy(sessionId);
          }
        }

        // ===== Download QR Code =====
        function downloadQR() {
          const img = document.getElementById('qrCodeImg');
          if (!img) return;
          
          const link = document.createElement('a');
          link.href = img.src;
          link.download = 'whatsapp-qr-code.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showStatus('✅ QR Code downloaded successfully!', 'success');
          logActivity('Downloaded QR Code', 'fa-download');
          createConfetti();
        }

        // ===== Refresh QR Code =====
        function refreshQR() {
          const sid = document.getElementById('sessionId').value;
          showStatus('🔄 Refreshing QR code...', 'success');
          logActivity('Refreshed QR Code', 'fa-sync');
          setTimeout(() => {
            location.href = '/session?sid=' + encodeURIComponent(sid);
          }, 500);
        }

        // ===== QR Auto-Refresh with Countdown =====
        function startQRTimer() {
          qrTimeLeft = 30;
          const countdownEl = document.getElementById('qrCountdown');
          const progressBar = document.getElementById('qrProgressBar');
          
          if (!countdownEl || !progressBar) return;
          
          // Clear existing intervals
          clearInterval(qrCountdownInterval);
          clearTimeout(qrRefreshTimer);
          
          // Update countdown every second
          qrCountdownInterval = setInterval(() => {
            qrTimeLeft--;
            countdownEl.textContent = qrTimeLeft;
            progressBar.style.width = ((qrTimeLeft / 30) * 100) + '%';
            
            if (qrTimeLeft <= 0) {
              clearInterval(qrCountdownInterval);
            }
          }, 1000);
          
          // Refresh after 30 seconds
          qrRefreshTimer = setTimeout(() => {
            refreshQR();
          }, 30000);
        }

        // Load saved theme and initialize
        window.addEventListener('DOMContentLoaded', () => {
          const savedTheme = localStorage.getItem('theme-mode');
          if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            document.getElementById('themeIcon').className = 'fas fa-sun';
          }
          createParticles();
          startQRTimer();
          updateConnectionStatus();
          detectDeviceInfo();
          updateProgressStep(2); // Start at step 2 (Scan/Code)
          
          // Initialize session timer and stats
          startSessionTimer();
          logActivity('Session started', 'fa-play');
          updateStats();
          
          // Start checking session status every 3 seconds
          if (!statusCheckInterval) {
            statusCheckInterval = setInterval(checkSessionStatus, 3000);
          }
          
          // Start heartbeat to keep session alive every 15 seconds
          if (!heartbeatInterval) {
            heartbeatInterval = setInterval(sendHeartbeat, 15000);
          }
          
          // Start polling for QR code every 2 seconds (more frequent initially)
          if (!qrCheckInterval) {
            qrCheckInterval = setInterval(checkForQR, 2000);
          }
          
          // Initial check for QR code
          setTimeout(checkForQR, 1000);
        });

        // ===== Particles Animation =====
        function createParticles() {
          const container = document.getElementById('particlesContainer');
          if (!container) return;
          
          // Clear existing particles
          container.innerHTML = '';
          
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

        // ===== Connection Status =====
        function updateConnectionStatus() {
          const statusDot = document.getElementById('statusDot');
          const statusText = document.getElementById('statusText');
          
          // Simple online/offline detection
          if (navigator.onLine) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connected';
          } else {
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Offline';
          }
        }

        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);

        // ===== Pairing Code Generation =====
        async function generatePairingCode(button) {
          const sessionId = document.getElementById('sessionId').value.trim();
          const phoneInput = document.getElementById('phoneNumber');
          let phoneNumber = phoneInput.value.trim();
          
          // Validation
          if (!phoneNumber) {
            showStatus('❌ Please enter your WhatsApp phone number', 'error');
            phoneInput.focus();
            return;
          }

          // Clean phone number - remove all non-digits
          const cleanedPhone = phoneNumber.replace(/\D/g, '');
          
          // Validate length
          if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
            showStatus('❌ Invalid phone format. Use country code + number (10-15 digits total). Example: 14155552671 (US) or 919876543210 (India)', 'error');
            phoneInput.focus();
            return;
          }

          if (!button) button = document.querySelector('[onclick*="generatePairingCode"]');
          if (!button) {
            showStatus('❌ Generate button not found. Please refresh the page.', 'error');
            return;
          }
          const originalHTML = button.innerHTML;
          button.disabled = true;
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to WhatsApp...';

          let retryCount = 0;
          const maxRetries = 2; // Allow up to 2 retries

          const attemptRequest = async () => {
            try {
              button.innerHTML = retryCount > 0 ? 
                '<i class="fas fa-spinner fa-spin"></i> Retrying... (Attempt ' + (retryCount + 1) + '/3)' :
                '<i class="fas fa-spinner fa-spin"></i> Generating code (1/3)...';

              const response = await fetch('/api/pairing-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  phoneNumber: cleanedPhone, 
                  sessionId: sessionId 
                })
              });

              const data = await response.json();
              
              // Handle response
              if (response.ok && data.success && data.code) {
                const code = String(data.code).trim();
                const codeEl = document.getElementById('pairingCode');
                codeEl.textContent = code;
                codeEl.classList.remove('code-placeholder');
                codeEl.classList.add('copy-success');
                
                button.disabled = false;
                button.innerHTML = originalHTML;
                
                showStatus('✅ Pairing code ready: ' + code + ' (Valid for 60 seconds)', 'success');
                showToast('Open WhatsApp on your phone and enter the code', 'info');
                createConfetti();
                updateProgressStep(3); // Update progress to step 3 (Connect)
                logActivity('Generated pairing code: ' + code, 'fa-key');
                recordAttempt(true);
                
                // Show timer
                document.getElementById('codeTimer').classList.remove('hidden');
                
                // Show Open WhatsApp button
                const openWABtn = document.getElementById('openWhatsAppBtn');
                if (openWABtn) openWABtn.classList.remove('hidden');
                
                startCodeExpiryTimer();
                
                playSuccessSound();
                return true;

              } else {
                const errorMsg = data.error || 'Failed to generate code';
                
                // Enhanced error handling with specific messages
                let userFriendlyMsg = errorMsg;
                
                if (errorMsg.toLowerCase().includes('check') || 
                    errorMsg.toLowerCase().includes('invalid phone')) {
                  userFriendlyMsg = '❌ Invalid phone number. Make sure it includes the country code (e.g., +1, +91, +44). Try entering it as: ' + cleanedPhone;
                } else if (errorMsg.toLowerCase().includes('timeout')) {
                  userFriendlyMsg = '❌ Request timed out. Your internet might be slow. Try again.';
                } else if (errorMsg.toLowerCase().includes('not ready')) {
                  userFriendlyMsg = '❌ Server not ready. Please refresh the page and try again.';
                } else if (errorMsg.toLowerCase().includes('network')) {
                  userFriendlyMsg = '❌ Network error. Check your internet connection.';
                } else if (errorMsg.toLowerCase().includes('baileys') || errorMsg.toLowerCase().includes('whatsapp')) {
                  userFriendlyMsg = '❌ WhatsApp connection issue. Try refreshing the page or use QR code instead.';
                }
                
                // Check if we should retry on network/timeout errors
                if (retryCount < maxRetries && 
                    (response.status === 503 || response.status === 504 ||
                     errorMsg.toLowerCase().includes('timeout') || 
                     errorMsg.toLowerCase().includes('not ready') ||
                     errorMsg.toLowerCase().includes('network'))) {
                  retryCount++;
                  showToast('Retrying... (Attempt ' + (retryCount + 1) + ')', 'warning');
                  await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds before retry
                  return attemptRequest();
                } else {
                  button.disabled = false;
                  button.innerHTML = originalHTML;
                  showStatus(userFriendlyMsg, 'error');
                  recordAttempt(false);
                  return false;
                }
              }
            } catch (error) {
              button.disabled = false;
              button.innerHTML = originalHTML;
              
              console.error('Pairing code error:', error);
              
              let userMsg = 'Unable to generate pairing code';
              
              // Better error handling
              if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                userMsg = '❌ Network error. Check your internet connection and try again.';
              } else if (error.message.includes('timeout')) {
                userMsg = '❌ Request timeout. Please try again.';
              } else if (error.message.includes('abort')) {
                userMsg = '❌ Request was cancelled. Please try again.';
              }
              
              // Offer fallback suggestion
              if (retryCount < maxRetries && 
                  (userMsg.includes('Network') || userMsg.includes('timeout'))) {
                showToast('Will retry in a moment...', 'warning');
                retryCount++;
                await new Promise(r => setTimeout(r, 2000));
                return attemptRequest();
              } else {
                showStatus(userMsg, 'error');
                showToast('💡 Tip: If pairing code fails, try the QR scan method instead', 'info');
                recordAttempt(false);
                return false;
              }
            }
          };

          await attemptRequest();
        }

        // ===== Code Expiry Timer with Visual Countdown =====
        function startCodeExpiryTimer() {
          codeTimeLeft = 60;
          const countdownEl = document.getElementById('codeCountdown');
          const progressBar = document.getElementById('codeProgressBar');
          
          // Clear existing timers
          clearInterval(codeCountdownInterval);
          clearTimeout(codeExpiryTimer);
          
          // Update countdown every second
          codeCountdownInterval = setInterval(() => {
            codeTimeLeft--;
            if (countdownEl) countdownEl.textContent = codeTimeLeft;
            if (progressBar) progressBar.style.width = ((codeTimeLeft / 60) * 100) + '%';
            
            if (codeTimeLeft <= 0) {
              clearInterval(codeCountdownInterval);
            }
          }, 1000);
          
          // Expire code after 60 seconds
          codeExpiryTimer = setTimeout(() => {
            const codeEl = document.getElementById('pairingCode');
            codeEl.textContent = '⏰ Code expired';
            codeEl.classList.add('code-placeholder');
            document.getElementById('codeTimer').classList.add('hidden');
            showStatus('⏰ Pairing code expired. Generate a new one.', 'error');
          }, 60000);
        }

        // ===== Copy to Clipboard with Animation =====
        function copyToClipboard() {
          const codeEl = document.getElementById('pairingCode');
          const code = codeEl.textContent;
          
          if (code.includes('Generate') || code.includes('Code') || code.includes('expired')) {
            return;
          }
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
              codeEl.classList.add('copy-success');
              showStatus('✅ Code copied to clipboard!', 'success');
              createConfetti();
              
              setTimeout(() => {
                codeEl.classList.remove('copy-success');
              }, 300);
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
          
          // Also show as toast notification
          showToast(message.replace(/<[^>]*>/g, ''), type === 'success' ? 'success' : 'error');
          
          const duration = type === 'success' ? 8000 : 5000;
          setTimeout(() => {
            status.classList.remove('show');
          }, duration);
        }

        // ===== Keyboard Shortcuts =====
        document.addEventListener('keydown', (e) => {
          // Enter to generate code
          if (e.key === 'Enter' && document.activeElement.id === 'phoneNumber') {
            generatePairingCode();
          }
          
          // Ctrl+C to copy code
          if (e.ctrlKey && e.key === 'c') {
            const code = document.getElementById('pairingCode').textContent;
            if (!code.includes('Generate') && !code.includes('Code') && !code.includes('expired')) {
              e.preventDefault();
              copyToClipboard();
            }
          }
          
          // Escape to close modal
          if (e.key === 'Escape') {
            document.getElementById('helpModal').classList.remove('show');
          }
          
          // F1 for help
          if (e.key === 'F1') {
            e.preventDefault();
            toggleHelpModal();
          }
        });

        // ===== Progress Steps =====
        function updateProgressStep(step) {
          // Update circles
          for (let i = 1; i <= 4; i++) {
            const circle = document.getElementById('step' + i);
            if (!circle) continue;
            
            if (i < step) {
              circle.classList.add('completed');
              circle.classList.remove('active');
            } else if (i === step) {
              circle.classList.add('active');
              circle.classList.remove('completed');
            } else {
              circle.classList.remove('active', 'completed');
            }
          }
          
          // Update progress line
          const progressFill = document.getElementById('progressLineFill');
          if (progressFill) {
            const percentage = ((step - 1) / 3) * 100;
            progressFill.style.width = percentage + '%';
          }
        }

        // ===== Success Screen =====
        function showSuccessScreen(sessionData) {
          const successScreen = document.getElementById('successScreen');
          const timeEl = document.getElementById('successTime');
          
          if (timeEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString();
          }
          
          successScreen.classList.add('show');
          createConfetti();
          updateProgressStep(4);
          playSuccessSound();
          recordAttempt(true);
          logActivity('Connection established', 'fa-check-circle');
          showToast('Connection successful!', 'success');
          
          // Auto-hide after 6 seconds
          setTimeout(() => {
            successScreen.classList.remove('show');
          }, 6000);
        }

        // ===== Device Info Detection =====
        function detectDeviceInfo() {
          // Detect browser
          const ua = navigator.userAgent;
          let browserName = 'Unknown';
          
          if (ua.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
          } else if (ua.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
          } else if (ua.indexOf('Safari') > -1) {
            browserName = 'Safari';
          } else if (ua.indexOf('Edge') > -1) {
            browserName = 'Edge';
          } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
            browserName = 'Opera';
          }
          
          // Detect platform
          let platform = navigator.platform || 'Unknown';
          if (platform.indexOf('Win') > -1) platform = 'Windows';
          else if (platform.indexOf('Mac') > -1) platform = 'MacOS';
          else if (platform.indexOf('Linux') > -1) platform = 'Linux';
          else if (platform.indexOf('Android') > -1) platform = 'Android';
          else if (platform.indexOf('iPhone') > -1 || platform.indexOf('iPad') > -1) platform = 'iOS';
          
          // Get screen resolution
          const screen = window.screen.width + 'x' + window.screen.height;
          
          // Update UI
          const browserEl = document.getElementById('deviceBrowser');
          const platformEl = document.getElementById('devicePlatform');
          const screenEl = document.getElementById('deviceScreen');
          
          if (browserEl) browserEl.textContent = browserName;
          if (platformEl) platformEl.textContent = platform;
          if (screenEl) screenEl.textContent = screen;
          
          // Connection type
          const connEl = document.getElementById('deviceConnection');
          if (connEl) {
            if (location.protocol === 'https:') {
              connEl.textContent = 'Secure';
              connEl.className = 'badge badge-success';
            } else {
              connEl.textContent = 'HTTP';
              connEl.className = 'badge badge-warning';
            }
          }
        }

        // ===== Enhanced Session Status Checker =====
        
        async function checkSessionStatus() {
          try {
            const sessionId = document.getElementById('sessionId').value;
            const response = await fetch('/api/session-status?sessionId=' + encodeURIComponent(sessionId));
            const data = await response.json();
            
            if (data.success && data.status === 'connected') {
              // Update progress to step 3
              updateProgressStep(3);
              
              // Show success screen after a brief delay
              setTimeout(() => {
                showSuccessScreen({
                  sessionId: sessionId,
                  timestamp: new Date()
                });
              }, 500);
              
              // Stop checking
              clearInterval(statusCheckInterval);
              clearInterval(qrCheckInterval);
              statusCheckInterval = null;
              qrCheckInterval = null;
            } else if (data.success && data.qr && !data.connected) {
              // QR code is now available, generate the image
              updateQRDisplay(data.qr);
            }
          } catch (error) {
            // Silent fail, will retry
          }
        }

        // ===== Dedicated QR Code Polling =====
        async function checkForQR() {
          try {
            const sessionId = document.getElementById('sessionId').value;
            const response = await fetch('/api/qr?sessionId=' + encodeURIComponent(sessionId));
            const data = await response.json();
            
            if (data.success && data.qr) {
              updateQRDisplay(data.qr);
              // Stop polling once we have the QR
              if (qrCheckInterval) {
                clearInterval(qrCheckInterval);
                qrCheckInterval = null;
              }
            } else if (data.waiting) {
              // Still waiting for QR, continue polling
              logActivity('Waiting for QR code...', 'fa-clock');
            }
          } catch (error) {
            console.error('QR check error:', error);
          }
        }

        // ===== Send Heartbeat to Keep Session Alive =====
        async function sendHeartbeat() {
          try {
            const sessionId = document.getElementById('sessionId').value;
            await fetch('/api/heartbeat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: sessionId })
            });
          } catch (e) {
            console.log('Heartbeat failed:', e.message);
          }
        }

        // ===== Update QR Display =====
        function updateQRDisplay(qrDataUrl) {
          var qrContainer = document.querySelector('.qr-display');
          if (!qrContainer) return;
          
          // Check if QR already displayed
          var existingImg = qrContainer.querySelector('img');
          if (existingImg && existingImg.src === qrDataUrl) {
            return; // Same QR, no update needed
          }
          
          // Update QR image
          var qrHtml = '<img src="' + qrDataUrl + '" alt="WhatsApp QR Code" id="qrCodeImg" style="max-width: 100%; height: auto;">' +
            '<div class="qr-scanner">' +
            '<div class="scan-line"></div>' +
            '<div class="scan-corner top-left"></div>' +
            '<div class="scan-corner top-right"></div>' +
            '<div class="scan-corner bottom-left"></div>' +
            '<div class="scan-corner bottom-right"></div>' +
            '</div>';
          
          qrContainer.innerHTML = qrHtml;
          
          // Add refresh and download buttons if not present
          var buttonContainer = qrContainer.nextElementSibling;
          if (!buttonContainer || !buttonContainer.querySelector('.btn-secondary')) {
            var buttonsHtml = '<div style="display: flex; gap: 10px; margin-top: 12px;">' +
              '<button type="button" class="btn btn-secondary" onclick="refreshQR()" style="flex: 1; padding: 12px;">' +
              '<i class="fas fa-sync-alt"></i> Refresh' +
              '</button>' +
              '<button type="button" class="download-qr-btn tooltip" onclick="downloadQR()" style="flex: 1;">' +
              '<i class="fas fa-download"></i> Download' +
              '<span class="tooltiptext">Save QR for offline use</span>' +
              '</button>' +
              '</div>';
            qrContainer.insertAdjacentHTML('afterend', buttonsHtml);
          }
          
          logActivity('QR code received', 'fa-qrcode');
          showToast('QR Code ready!', 'success');
        }

        // ===== Expose functions to global scope for onclick handlers =====
        window.toggleTheme = toggleTheme;
        window.toggleHelpModal = toggleHelpModal;
        window.toggleTipsDrawer = toggleTipsDrawer;
        window.toggleTroubleshoot = toggleTroubleshoot;
        window.copySessionId = copySessionId;
        window.downloadQR = downloadQR;
        window.refreshQR = refreshQR;
        window.generatePairingCode = generatePairingCode;
        window.copyToClipboard = copyToClipboard;

        // ===== Open WhatsApp & Copy Code =====
        function openWhatsApp() {
          const codeEl = document.getElementById('pairingCode');
          const code = codeEl.textContent;
          
          if (code.includes('Generate') || code.includes('Code') || code.includes('expired')) {
            showToast('Please generate a code first', 'warning');
            return;
          }
          
          // Copy to clipboard first
          copyToClipboard();
          
          // Show toast explaining next steps
          showToast('Code copied! Now paste it in WhatsApp', 'success');
          
          // Simple delay before opening WhatsApp
          setTimeout(() => {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
              window.open('whatsapp://', '_blank');
            } else {
              window.open('https://web.whatsapp.com', '_blank');
            }
          }, 800);
        }

        window.openWhatsApp = openWhatsApp;

        // ===== Cleanup on page unload =====
        window.addEventListener('beforeunload', () => {
          clearInterval(qrCountdownInterval);
          clearInterval(codeCountdownInterval);
          clearInterval(sessionDurationInterval);
          clearTimeout(qrRefreshTimer);
          clearTimeout(codeExpiryTimer);
          if (statusCheckInterval) {
            clearInterval(statusCheckInterval);
          }
          if (qrCheckInterval) {
            clearInterval(qrCheckInterval);
          }
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
          }
        });
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
