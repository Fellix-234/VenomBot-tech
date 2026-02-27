import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';
import { getSocket } from '../modules/connection.js';

export default {
  name: 'setpp',
  aliases: ['setbotpp', 'botpic', 'setprofile'],
  category: 'owner',
  description: 'Set bot profile picture',
  usage: '!setpp (reply to image)',
  ownerOnly: true,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, isOwner, quoted }) => {
    // Check if owner
    if (!isOwner) {
      await sendText(fromJid, '❌ *Access Denied!*\n\nThis command is only for bot owner.', msg);
      return;
    }
    
    // Check if replied to an image
    const message = quoted || msg;
    if (!message.message?.imageMessage) {
      let text = `🖼️ *SET BOT PROFILE PICTURE*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* Reply to an image with ${config.bot.prefix}setpp\n\n`;
      text += `✨ *Features:*\n`;
      text += `   • Set bot profile picture\n`;
      text += `   • Change bot display\n`;
      text += `   • Quick & Easy\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `💡 *Note:* Reply to any image to set it as bot's profile picture`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    try {
      const sock = getSocket();
      const media = await sock.downloadMediaMessage(message.message.imageMessage);
      
      if (media) {
        await sock.updateProfilePicture(config.bot.owner, media);
        
        let text = `✅ *PROFILE PICTURE UPDATED!*\n\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🖼️ Bot profile picture has been changed!\n\n`;
        text += `_✨ Changes may take a few minutes to reflect_`;
        
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      let text = `❌ *ERROR!*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `Failed to update profile picture.\n`;
      text += `Error: ${error.message}`;
      
      await sendText(fromJid, text, msg);
    }
  }
};
