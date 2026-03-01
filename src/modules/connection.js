import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { handleMessages } from './messageHandler.js';
import { deletedMessages } from '../utils/cache.js';

let sock;
let qrGenerated = false;
let currentQR = null;
let botId = null;
let isConnecting = false;
let reconnectTimeout = null;

/**
 * Get current QR code data
 */
export const getCurrentQR = () => currentQR;

/**
 * Initialize WhatsApp connection
 */
export const connectToWhatsApp = async () => {
  if (isConnecting) {
    return sock;
  }

  isConnecting = true;

  let state;
  let saveCreds;
  let version;

  try {
    const authState = await useMultiFileAuthState(config.paths.session);
    state = authState.state;
    saveCreds = authState.saveCreds;
    const latestVersion = await fetchLatestBaileysVersion();
    version = latestVersion.version;
  } catch (error) {
    isConnecting = false;
    throw error;
  }

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
        logger.info('📱 Main bot QR generated (hidden from terminal logs)');
        qrGenerated = true;
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        if (!reconnectTimeout) {
          logger.warn(`Connection closed (code: ${statusCode || 'unknown'}), reconnecting...`);
          reconnectTimeout = setTimeout(async () => {
            reconnectTimeout = null;
            await connectToWhatsApp();
          }, 3000);
        }
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

      // Capture bot ID - try multiple methods to ensure we get it
      if (sock.user) {
        // Method 1: Extract from user.id (format: "1234567890:XX@s.whatsapp.net")
        if (sock.user.id) {
          botId = sock.user.id.split(':')[0] || sock.user.id.split('@')[0];
        }
        // Method 2: Use user.name if id doesn't work
        if (!botId && sock.user.name) {
          botId = sock.user.name;
        }
        logger.info(`🔑 Bot User ID: ${sock.user.id}`);
        logger.info(`🔑 Session ID: ${botId}`);
      } else {
        logger.warn('⚠️ Bot user info not available yet');
      }

      // Send welcome message to owner
      if (config.bot.owner && config.bot.owner.trim() !== '') {
        try {
          const ownerJid = config.bot.owner.includes('@') ? config.bot.owner : `${config.bot.owner}@s.whatsapp.net`;
          
          // Get full session information
          const sessionInfo = {
            phoneNumber: botId || 'N/A',
            fullUserId: sock.user?.id || 'N/A',
            userName: sock.user?.name || 'N/A'
          };
          
          // Professional welcome message with image
          const welcomeCaption = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          ┃
┃   ✅ *${config.bot.name.toUpperCase()} CONNECTED*   ┃
┃                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🎉 *Welcome to Your Professional WhatsApp Bot!*

Your bot is now online and ready to serve you with advanced automation and smart features.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 *YOUR SESSION INFORMATION*

📱 Phone Number: \`${sessionInfo.phoneNumber}\`
🆔 Full User ID: \`${sessionInfo.fullUserId}\`
👤 Username: \`${sessionInfo.userName}\`

⚠️ *SECURITY WARNING*  
🔒 Keep this information confidential
🚫 Never share your session credentials
💾 Save this information securely

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *BOT INFORMATION*
▸ Version: *${config.bot.version}*
▸ Prefix: *${config.bot.prefix}*
▸ Status: *Active & Running*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *QUICK START*
Type *${config.bot.prefix}help* to view all available commands

🌐 Need support? Visit our channel!
${config.bot.channel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_Powered by ${config.bot.name} v${config.bot.version}_
_Professional WhatsApp Automation_`;

          // Try to send with image from assets
          const imagePath = path.join(config.paths.assets, 'WhatsApp Image 2026-02-27 at 15.42.21.jpeg');
          
          if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            await sock.sendMessage(ownerJid, { 
              image: imageBuffer,
              caption: welcomeCaption
            });
            logger.success('📨 Professional welcome message with image sent to owner');
          } else {
            // Fallback to text-only if image not found
            await sock.sendMessage(ownerJid, { text: welcomeCaption });
            logger.success('📨 Welcome message sent to owner (without image)');
            logger.warn('Image not found at:', imagePath);
          }
        } catch (error) {
          logger.error('Failed to send welcome message:', error.message);
          logger.error('Error details:', error);
        }
      } else {
        logger.warn('⚠️ Owner number not configured. Set OWNER_NUMBER in .env file to receive session info.');
        logger.info(`📝 Current bot session - Phone: ${botId || 'N/A'}, Full ID: ${sock.user?.id || 'N/A'}`);
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

  isConnecting = false;
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
    // Format phone number: remove any non-digits
    const cleaned = phoneNumber.toString().replace(/\D/g, '');
    
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error('Phone number must be 10-15 digits');
    }

    logger.info(`📱 Requesting pairing code for: ${cleaned}`);
    
    // Check if socket exists
    if (!sock) {
      throw new Error('WhatsApp connection not initialized. Please wait a moment and try again.');
    }
    
    // Check if already connected (pairing codes only work before authentication)
    if (sock.user) {
      throw new Error('Bot is already authenticated. Delete auth_info_baileys folder to start fresh.');
    }
    
    let code;
    
    // Try requestPairingCode method (standard Baileys method)
    if (typeof sock.requestPairingCode === 'function') {
      logger.info('Using requestPairingCode method');
      code = await sock.requestPairingCode(cleaned);
    } else if (typeof sock.requestPhoneNumberCode === 'function') {
      logger.info('Using requestPhoneNumberCode method');
      code = await sock.requestPhoneNumberCode(cleaned);
    } else {
      throw new Error('Pairing code not supported. Your Baileys version may be outdated. Use QR code instead.');
    }
    
    if (!code) {
      throw new Error('Failed to generate pairing code from WhatsApp');
    }

    logger.success(`✅ Pairing code generated: ${code}`);
    return code;
  } catch (error) {
    logger.error('Pairing code error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('already authenticated')) {
      throw new Error('Bot already connected. Delete session to generate new pairing code.');
    } else if (error.message.includes('not supported')) {
      throw new Error('Pairing codes not available. Please use the QR code method instead.');
    }
    
    throw error;
  }
};
