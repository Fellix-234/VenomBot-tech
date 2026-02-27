import { sendText } from '../modules/connection.js';
import { deletedMessages } from '../utils/cache.js';

export default {
  name: 'antidelete',
  aliases: ['deleted', 'seen'],
  category: 'utility',
  description: 'View recently deleted messages',
  usage: '!antidelete',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    const allMessages = deletedMessages.getAll();
    
    if (allMessages.length === 0) {
      await sendText(fromJid, '📭 No deleted messages found in cache.', msg);
      return;
    }

    // Get recent messages from this chat
    const chatMessages = allMessages
      .filter(([key]) => key.startsWith(fromJid))
      .slice(-5)
      .reverse();

    if (chatMessages.length === 0) {
      await sendText(fromJid, '📭 No deleted messages found in this chat.', msg);
      return;
    }

    let text = `╭─「 *DELETED MESSAGES* 」\n`;
    text += `│ Found ${chatMessages.length} recent deleted message(s)\n`;
    text += `╰────────────⦁\n\n`;

    for (const [key, message] of chatMessages) {
      const sender = message.sender || 'Unknown';
      const content = message.content || '[Media/Unsupported message]';
      const time = new Date(message.timestamp).toLocaleTimeString();
      
      text += `👤 *${sender.split('@')[0]}* _${time}_\n`;
      text += `💬 ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n\n`;
    }

    await sendText(fromJid, text, msg);
  }
};
