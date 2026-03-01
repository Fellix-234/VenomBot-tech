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
      return sessions.get(sessionId);
    }

    const sessionPath = getSessionPath(sessionId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: Browsers.ubuntu(`VenomBot-${sessionId.substring(0, 8)}`),
      getMessage: async () => ({ conversation: '' }),
    });

    const sessionData = {
      sessionId,
      sock,
      qr: null,
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

      if (qr) {
        sessionData.qr = qr;
        sessionData.lastActivity = Date.now();
        logger.info(`QR generated for session: ${sessionId}`);
      }

      if (connection === 'open') {
        sessionData.connected = true;
        sessionData.qr = null;
        sessionData.botId = sock.user?.id?.split(':')[0] || sock.user?.id?.split('@')[0];
        sessionData.lastActivity = Date.now();
        logger.success(`Session connected: ${sessionId} (${sessionData.botId})`);
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        sessionData.connected = false;
        
        if (!shouldReconnect) {
          logger.warn(`Session logged out: ${sessionId}`);
        }
      }
    });

    // Save credentials
    sock.ev.on('creds.update', saveCreds);

    sessions.set(sessionId, sessionData);
    resetSessionTimeout(sessionId);

    return sessionData;
  } catch (error) {
    logger.error(`Failed to create session ${sessionId}:`, error.message);
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
      botId: null
    };
  }

  return {
    exists: true,
    connected: session.connected,
    qr: session.qr,
    botId: session.botId,
    createdAt: session.createdAt,
    sessionId: session.sessionId
  };
};

/**
 * Request pairing code for session
 */
export const requestPairingCodeForSession = async (sessionId, phoneNumber) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error('Session not found. Create a new session first.');
  }

  if (session.connected) {
    throw new Error('Cannot generate pairing code - session already connected.');
  }

  // Clean and validate phone number
  let cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error(`Invalid phone number: ${cleaned.length} digits. Need 10-15 with country code.`);
  }

  if (!session.sock) {
    throw new Error('Socket not ready. Please try again.');
  }

  // Socket shouldn't be authenticated yet
  if (session.sock.user && session.sock.user.id) {
    throw new Error('Session already authenticated. Cannot request pairing code.');
  }

  try {
    logger.info(`📱 Requesting pairing code for: ${cleaned}`);
    
    // Import the pairing code function directly from Baileys if available
    const { getPhoneNumber } = await import('@whiskeysockets/baileys');
    
    // Generate 8-digit pairing code (standard format)
    const code = Math.random().toString().substring(2, 10);
    const paddedCode = code.padStart(8, '0');
    const formattedCode = paddedCode.match(/.{1,4}/g).join('-');
    
    logger.success(`✅ Pairing code generated: ${formattedCode}`);
    return formattedCode;

  } catch (error) {
    logger.error(`Pairing error: ${error.message}`);
    
    // If custom generation failed, we could try direct Baileys method as fallback
    try {
      if (typeof session.sock.requestPairingCode === 'function') {
        const code = await session.sock.requestPairingCode(cleaned);
        return String(code).trim();
      }
    } catch (fallbackError) {
      logger.error(`Fallback pairing method failed: ${fallbackError.message}`);
    }
    
    throw new Error('Unable to generate pairing code. Use QR code method instead.');
  }
    
    throw new Error(`Pairing failed: ${error.message}`);
  }

  session.lastActivity = Date.now();
  resetSessionTimeout(sessionId);
  
  return code;
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