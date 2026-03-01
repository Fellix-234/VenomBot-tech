import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const sessions = new Map();
const sessionTimeouts = new Map();
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

// Cool session ID generation words
const adjectives = [
  'Phoenix', 'Shadow', 'Storm', 'Thunder', 'Mystic', 'Dragon', 'Phantom', 'Titan',
  'Blazing', 'Silent', 'Cosmic', 'Neon', 'Void', 'Apex', 'Cyber', 'Quantum',
  'Rogue', 'Veritas', 'Apex', 'Venom', 'Inferno', 'Nexus'
];

const nouns = [
  'Warrior', 'Ninja', 'Knight', 'Cipher', 'Sentinel', 'Agent', 'Master', 'System',
  'Daemon', 'Echo', 'Ghost', 'Specter', 'Arrow', 'Saber', 'Spirit', 'Force',
  'Blade', 'Wraith', 'Icon', 'Pulse', 'Spark', 'Vortex'
];

/**
 * Generate cool standardized session ID
 * Format: VenomBot-Adjective-RandomCode (e.g., VenomBot-Phoenix-K9A3)
 */
export const generateSessionId = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomCode = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `VenomBot-${adj}-${randomCode}${randomNum}`;
};

/**
 * Get session path for a specific user session
 */
const getSessionPath = (sessionId) => {
  const basePath = path.dirname(config.paths.session);
  const sessionsPath = path.join(basePath, 'multi_sessions');
  
  if (!fs.existsSync(sessionsPath)) {
    fs.mkdirSync(sessionsPath, { recursive: true });
  }
  
  return path.join(sessionsPath, sessionId);
};

/**
 * Create new session
 */
export const createSession = async (sessionId) => {
  try {
    if (sessions.has(sessionId)) {
      const existingSession = sessions.get(sessionId);
      // If existing session is not connected, reset it
      if (!existingSession.connected) {
        logger.info(`Session ${sessionId} exists but not connected, recreating...`);
        await cleanupSession(sessionId);
      } else {
        logger.info(`Session ${sessionId} already exists and connected`);
        return existingSession;
      }
    }

    const sessionPath = getSessionPath(sessionId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    logger.info(`Creating new session: ${sessionId} with Baileys v${version.join('.')}`);

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: Browsers.ubuntu(`VenomBot-${sessionId.substring(0, 8)}`),
      // Add mobile mode for better compatibility
      mobile: true,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      getMessage: async () => ({ conversation: '' }),
    });

    const sessionData = {
      sessionId,
      sock,
      qr: null,
      qrUpdatedAt: null,
      connected: false,
      botId: null,
      createdAt: Date.now(),
      sessionPath,
      saveCreds,
      lastActivity: Date.now()
    };

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Log all connection updates for debugging
      logger.info(`Session ${sessionId} connection update:`, {
        connection,
        hasQR: !!qr,
        qrPreview: qr ? qr.substring(0, 50) + '...' : null
      });

      if (qr) {
        // Store the raw QR string from Baileys
        sessionData.qr = qr;
        sessionData.qrUpdatedAt = Date.now();
        sessionData.lastActivity = Date.now();
        logger.info(`QR code received for session: ${sessionId}`);
      }

      if (connection === 'open') {
        sessionData.connected = true;
        sessionData.qr = null; // Clear QR after successful connection
        sessionData.botId = sock.user?.id?.split(':')[0] || sock.user?.id?.split('@')[0];
        sessionData.lastActivity = Date.now();
        logger.success(`Session connected: ${sessionId} (${sessionData.botId})`);
        
        // Send session ID to user's WhatsApp DM
        try {
          const userJid = sock.user?.id;
          if (userJid) {
            const welcomeMessage = `✅ *VenomBot Connected Successfully!*\n\n` +
              `🆔 *Your Session ID:*\n\`\`\`${sessionId}\`\`\`\n\n` +
              `📱 *Bot ID:* ${sessionData.botId}\n` +
              `🕒 *Connected at:* ${new Date().toLocaleString()}\n\n` +
              `Keep this Session ID private and secure!\n\n` +
              `Type *!help* to see available commands.`;
            
            await sock.sendMessage(userJid, { text: welcomeMessage });
            logger.success(`Session ID sent to user: ${sessionData.botId}`);
          }
        } catch (dmError) {
          logger.error(`Failed to send DM: ${dmError.message}`);
        }
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        sessionData.connected = false;
        
        if (!shouldReconnect) {
          logger.warn(`Session logged out: ${sessionId}`);
        } else {
          logger.info(`Session connection closed, will retry: ${sessionId}`);
        }
      }
    });

    // Save credentials
    sock.ev.on('creds.update', saveCreds);

    sessions.set(sessionId, sessionData);
    resetSessionTimeout(sessionId);

    logger.info(`Session created: ${sessionId}`);
    return sessionData;
  } catch (error) {
    logger.error(`Failed to create session ${sessionId}:`, error.message);
    logger.error('Stack:', error.stack);
    throw error;
  }
};

/**
 * Get session by ID
 */
export const getSession = (sessionId) => {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastActivity = Date.now();
    resetSessionTimeout(sessionId);
  }
  return session;
};

/**
 * Get session status
 */
export const getSessionStatus = (sessionId) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return {
      exists: false,
      connected: false,
      qr: null,
      botId: null,
      message: 'Session not found'
    };
  }

  // Check if session is stale (no activity for too long)
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity;
  const isStale = timeSinceLastActivity > 120000; // 2 minutes

  return {
    exists: true,
    connected: session.connected,
    qr: session.qr, // Return raw QR string from Baileys
    qrUpdatedAt: session.qrUpdatedAt,
    botId: session.botId,
    createdAt: session.createdAt,
    sessionId: session.sessionId,
    lastActivity: session.lastActivity,
    isStale: isStale,
    timeSinceLastActivity: timeSinceLastActivity
  };
};

/**
 * Get QR code directly for API
 */
export const getSessionQR = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }
  return session.qr;
};

/**
 * Request pairing code for session
 */
export const requestPairingCodeForSession = async (sessionId, phoneNumber) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error('Session not found. Please refresh the page to create a new session.');
  }

  if (session.connected) {
    throw new Error('Session already connected. Cannot generate new pairing code.');
  }

  // Clean and validate phone number
  let cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error(`Invalid phone number: ${cleaned.length} digits. Need 10-15 digits with country code.`);
  }

  if (!session.sock) {
    throw new Error('Socket not ready. Please refresh the page and try again.');
  }

  logger.info(`📱 Requesting pairing code for session ${sessionId}: ${cleaned}`);

  // Check if socket has the required method
  if (typeof session.sock.requestPairingCode !== 'function') {
    logger.error('requestPairingCode method not available on socket');
    throw new Error('Pairing code not supported in this Baileys version. Please use QR code method instead.');
  }

  try {
    logger.info('Calling requestPairingCode method...');
    
    // Request the pairing code from Baileys
    const code = await session.sock.requestPairingCode(cleaned);
    
    if (!code) {
      throw new Error('No pairing code returned from WhatsApp');
    }

    // Format the code (Baileys returns it as a string)
    const formattedCode = String(code).trim();
    
    // Format as XXXX-XXXX if not already formatted
    const finalCode = formattedCode.includes('-') ? formattedCode : 
      formattedCode.match(/.{1,4}/g)?.join('-') || formattedCode;
    
    logger.success(`✅ Pairing code generated: ${finalCode}`);
    session.lastActivity = Date.now();
    
    return finalCode;
  } catch (error) {
    logger.error(`Pairing code error: ${error.message}`);
    
    // Provide more specific error messages
    if (error.message.includes('not supported')) {
      throw new Error('Pairing code not available. Please use the QR code scan method instead.');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      throw new Error('Connection timeout. Please check your internet and try again.');
    } else if (error.message.includes('already connected')) {
      throw new Error('This phone number is already linked. Use QR code instead.');
    } else if (error.message.includes('invalid')) {
      throw new Error('Invalid phone number. Please check and try again.');
    }
    
    throw new Error(`Unable to generate pairing code: ${error.message}`);
  }
};

/**
 * Clean up session
 */
export const cleanupSession = async (sessionId) => {
  try {
    const session = sessions.get(sessionId);
    
    if (!session) return false;

    // Close socket connection
    try {
      if (session.sock?.ws?.readyState === 1) {
        session.sock.ws.close();
      }
    } catch (e) {
      // Ignore socket close errors
    }

    // Clear timeout
    if (sessionTimeouts.has(sessionId)) {
      clearTimeout(sessionTimeouts.get(sessionId));
      sessionTimeouts.delete(sessionId);
    }

    sessions.delete(sessionId);

    // Optionally keep session files for download if connected
    // Delete only if not connected or older than 1 hour
    if (!session.connected || (Date.now() - session.createdAt > 60 * 60 * 1000)) {
      if (fs.existsSync(session.sessionPath)) {
        fs.rmSync(session.sessionPath, { recursive: true, force: true });
      }
    }

    logger.info(`Session cleaned up: ${sessionId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to cleanup session ${sessionId}:`, error.message);
    return false;
  }
};

/**
 * Reset session timeout
 */
const resetSessionTimeout = (sessionId) => {
  if (sessionTimeouts.has(sessionId)) {
    clearTimeout(sessionTimeouts.get(sessionId));
  }

  const timeout = setTimeout(() => {
    logger.info(`Session timeout, cleaning up: ${sessionId}`);
    cleanupSession(sessionId);
  }, SESSION_TTL);

  sessionTimeouts.set(sessionId, timeout);
};

/**
 * Get session credentials path for download
 */
export const getSessionCredentialsPath = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) return null;
  return session.sessionPath;
};

/**
 * List active sessions count
 */
export const getActiveSessionsCount = () => sessions.size;

/**
 * Cleanup all sessions on shutdown
 */
export const cleanupAllSessions = async () => {
  const sessionIds = Array.from(sessions.keys());
  await Promise.all(sessionIds.map(id => cleanupSession(id)));
};