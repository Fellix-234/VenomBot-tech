import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { parseCommand, isOwner, isGroup, extractUrls } from '../utils/helpers.js';
import { isRateLimited, getRateLimitRemaining } from '../utils/cache.js';
import { sendText, react } from './connection.js';
import { commandHandler } from './commandHandler.js';
import { db } from '../database/db.js';
import { deletedMessages } from '../utils/cache.js';

/**
 * Handle incoming messages
 */
export const handleMessages = async (sock, msg) => {
  try {
    // Ignore if no message
    if (!msg.message) return;

    // Extract message details
    const messageType = Object.keys(msg.message)[0];
    const fromJid = msg.key.remoteJid;
    const sender = msg.key.fromMe ? sock.user.id : msg.key.participant || fromJid;
    const isGroupMsg = isGroup(fromJid);
    
    // Get message text
    let messageText = '';
    if (msg.message.conversation) {
      messageText = msg.message.conversation;
    } else if (msg.message.extendedTextMessage) {
      messageText = msg.message.extendedTextMessage.text;
    } else if (msg.message.imageMessage) {
      messageText = msg.message.imageMessage.caption || '';
    } else if (msg.message.videoMessage) {
      messageText = msg.message.videoMessage.caption || '';
    }

    // Ignore empty messages
    if (!messageText) return;

    // Auto-read messages
    if (config.settings.autoRead) {
      await sock.readMessages([msg.key]);
    }

    // Auto react to messages
    if (config.settings.autoReact && !msg.key.fromMe) {
      const reactions = ['❤️', '👍', '😂', '🔥', '😊', '👀', '✨'];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
      try {
        await react(fromJid, msg.key, randomReaction);
      } catch (e) {
        // Ignore reaction errors
      }
    }

    // Log message to database
    if (db) {
      db.logMessage(sender, fromJid, messageText, messageType);
    }

    // Store message for antidelete feature
    const messageKey = `${fromJid}_${msg.key.id}`;
    deletedMessages.set(messageKey, {
      content: messageText,
      sender: sender,
      timestamp: Date.now(),
      type: messageType
    });

    // Anti-link feature
    if (config.settings.antiLink && isGroupMsg && !isOwner(sender)) {
      const urls = extractUrls(messageText);
      if (urls.length > 0) {
        await sendText(fromJid, '❌ Links are not allowed in this group!', msg);
        // You can add kick functionality here
        return;
      }
    }

    // Check if message is a command
    const parsed = parseCommand(messageText);
    if (!parsed) return;

    const { command, args } = parsed;

    // Log command usage
    logger.command(sender.split('@')[0], command);

    // Check rate limiting
    if (!isOwner(sender)) {
      if (isRateLimited(sender)) {
        const remaining = getRateLimitRemaining(sender);
        const seconds = Math.ceil((remaining - Date.now()) / 1000);
        await sendText(
          fromJid,
          `⏱️ Please wait ${seconds}s before using another command!`,
          msg
        );
        return;
      }
    }

    // React to command with ⏳
    if (config.settings.autoTyping) {
      await react(fromJid, msg.key, '⏳');
    }

    // Build message context
    const msgContext = {
      sock,
      msg,
      command,
      args,
      sender,
      fromJid,
      isGroup: isGroupMsg,
      isOwner: isOwner(sender),
      messageText,
      quoted: msg.message.extendedTextMessage?.contextInfo?.quotedMessage,
    };

    // Execute command
    await commandHandler(msgContext);

    // React with ✅ after successful execution
    if (config.settings.autoTyping) {
      await react(fromJid, msg.key, '✅');
    }

  } catch (error) {
    logger.error('Error handling message:', error);
    try {
      await sendText(msg.key.remoteJid, '❌ An error occurred while processing your request.');
    } catch (e) {
      logger.error('Error sending error message:', e);
    }
  }
};
