import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { handleMessages } from './messageHandler.js';
import { deletedMessages } from '../utils/cache.js';

let sock;
let qrGenerated = false;
let currentQR = null;
let botId = null;

/**
 * Get current QR code data
 */
export const getCurrentQR = () => currentQR;

/**
 * Initialize WhatsApp connection
 */
export const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(config.paths.session);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser: Browsers.ubuntu('VenomBot'),
    getMessage: async (key) => {
      return { conversation: '' };
    },
  });

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      if (!qrGenerated) {
        logger.info('📱 Scan QR code to login:');
        qrcode.generate(qr, { small: true });
        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        logger.info(`🌐 Or visit: ${renderUrl}/qr to scan from browser`);
        qrGenerated = true;
      }
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        logger.warn('Connection closed, reconnecting...');
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        logger.error('Connection closed. You are logged out!');
        process.exit(1);
      }
      qrGenerated = false;
    }

    if (connection === 'open') {
      logger.success('✅ Connected to WhatsApp!');
      logger.info(`Bot: ${config.bot.name} v${config.bot.version}`);
      qrGenerated = false;
      currentQR = null;

      // Capture bot ID
      botId = sock.user?.id?.split(':')[0];
      logger.info(`🔑 Session ID: ${botId}`);

      // Send welcome message to owner
      if (config.bot.owner) {
        try {
          const ownerJid = config.bot.owner.includes('@') ? config.bot.owner : `${config.bot.owner}@s.whatsapp.net`;
          const welcomeMsg = `╔════════════════════════════════════╗
║                                ║
║     ✅ ${config.bot.name} Connected!         ║
║                                ║
║  Session ID:                   ║
║  ${botId}  ║
║                                ║
║  Version: ${config.bot.version}                  ║
║  Prefix: ${config.bot.prefix}                     ║
║                                ║
║  Type !help to see commands    ║
║                                ║
╚════════════════════════════════════╝`;

          await sock.sendMessage(ownerJid, { text: welcomeMsg });
          logger.success('📨 Welcome message sent to owner');
        } catch (error) {
          logger.error('Failed to send welcome message:', error.message);
        }
      }
    }
  });

  // Handle credentials update
  sock.ev.on('creds.update', saveCreds);

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      for (const msg of messages) {
        await handleMessages(sock, msg);
      }
    }
  });

  // Handle group participants update
  sock.ev.on('group-participants.update', async (update) => {
    logger.info('Group participants update:', update);
    // You can add group welcome/goodbye messages here
  });

  // Handle message delete (antidelete feature)
  sock.ev.on('messages.delete', async (update) => {
    try {
      const keys = update.keys || [];
      for (const key of keys) {
        const chatJid = key.remoteJid;
        const messageKey = `${chatJid}_${key.id}`;
        
        // Get the stored message content from cache
        const storedMessage = deletedMessages.get(messageKey);
        if (storedMessage) {
          logger.info(`Message deleted in ${chatJid}: ${storedMessage.content?.substring(0, 50)}...`);
        }
      }
    } catch (error) {
      logger.error('Error handling message delete:', error);
    }
  });

  return sock;
};

/**
 * Send message
 */
export const sendMessage = async (jid, content, options = {}) => {
  try {
    return await sock.sendMessage(jid, content, options);
  } catch (error) {
    logger.error('Error sending message:', error);
  }
};

/**
 * Send text message
 */
export const sendText = async (jid, text, quoted = null) => {
  return sendMessage(jid, { text }, quoted ? { quoted } : {});
};

/**
 * Send image
 */
export const sendImage = async (jid, image, caption = '', quoted = null) => {
  return sendMessage(jid, { image, caption }, quoted ? { quoted } : {});
};

/**
 * Send video
 */
export const sendVideo = async (jid, video, caption = '', quoted = null) => {
  return sendMessage(jid, { video, caption }, quoted ? { quoted } : {});
};

/**
 * Send audio
 */
export const sendAudio = async (jid, audio, quoted = null) => {
  return sendMessage(jid, { audio, mimetype: 'audio/mp4', ptt: true }, quoted ? { quoted } : {});
};

/**
 * Send document
 */
export const sendDocument = async (jid, document, filename, mimetype, quoted = null) => {
  return sendMessage(jid, { document, fileName: filename, mimetype }, quoted ? { quoted } : {});
};

/**
 * Send sticker
 */
export const sendSticker = async (jid, sticker, quoted = null) => {
  return sendMessage(jid, { sticker }, quoted ? { quoted } : {});
};

/**
 * React to message
 */
export const react = async (jid, key, emoji) => {
  return sendMessage(jid, {
    react: {
      text: emoji,
      key: key,
    },
  });
};

/**
 * Get group metadata
 */
export const getGroupMetadata = async (jid) => {
  try {
    return await sock.groupMetadata(jid);
  } catch (error) {
    logger.error('Error getting group metadata:', error);
    return null;
  }
};

/**
 * Get profile picture
 */
export const getProfilePicture = async (jid) => {
  try {
    return await sock.profilePictureUrl(jid, 'image');
  } catch (error) {
    return null;
  }
};

/**
 * Get socket instance
 */
export const getSocket = () => sock;

/**
 * Get bot ID/session
 */
export const getBotId = () => botId;

/**
 * Request pairing code for phone number
 */
export const requestPairingCode = async (phoneNumber) => {
  try {
    if (!sock) {
      throw new Error('WhatsApp socket not connected yet. Please wait and try again.');
    }

    // Format phone number: remove any non-digits
    const cleaned = phoneNumber.toString().replace(/\D/g, '');
    
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error('Phone number must be 10-15 digits');
    }

    logger.info(`📱 Requesting pairing code for: ${cleaned}`);
    
    // Try requestPhoneNumberCode method (works with Baileys 6.7.8+)
    let code;
    
    // Check if method exists and use it
    if (typeof sock.requestPhoneNumberCode === 'function') {
      code = await sock.requestPhoneNumberCode(cleaned);
    } else if (typeof sock.requestPairingCode === 'function') {
      code = await sock.requestPairingCode(cleaned);
    } else {
      // Fallback: generate a code locally for testing
      throw new Error('Pairing code method not available. Try QR code instead.');
    }
    
    if (!code) {
      throw new Error('Failed to generate pairing code');
    }

    logger.success(`✅ Pairing code generated: ${code}`);
    return code;
  } catch (error) {
    logger.error('Pairing code error:', error.message);
    throw new Error(`Pairing failed: ${error.message}`);
  }
};
