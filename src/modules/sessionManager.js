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

/**
 * Generate unique session ID
 */
export const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
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
    throw new Error('Session not found');
  }

  const cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Phone number must be 10-15 digits');
  }

  if (session.connected) {
    throw new Error('Session already connected');
  }

  let code;
  
  if (typeof session.sock.requestPairingCode === 'function') {
    code = await session.sock.requestPairingCode(cleaned);
  } else if (typeof session.sock.requestPhoneNumberCode === 'function') {
    code = await session.sock.requestPhoneNumberCode(cleaned);
  } else {
    throw new Error('Pairing code not supported');
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