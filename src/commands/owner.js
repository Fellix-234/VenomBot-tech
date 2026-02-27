import { sendText } from '../modules/connection.js';

export default {
  name: 'owner',
  aliases: ['creator', 'dev'],
  category: 'general',
  description: 'Display bot owner information',
  usage: '!owner',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const { config } = await import('../config.js');
    
    let text = `╭─「 *BOT OWNER* 」\n`;
    text += `│\n`;
    text += `│ • *Bot Name:* ${config.bot.name}\n`;
    text += `│ • *Owner:* @${config.bot.owner}\n`;
    text += `│ • *Version:* ${config.bot.version}\n`;
    text += `│\n`;
    text += `╰────────────⦁\n\n`;
    text += `_Contact owner for support or inquiries_`;
    
    const { getSocket } = await import('../modules/connection.js');
    const socket = getSocket();
    
    await socket.sendMessage(fromJid, {
      text,
      mentions: [`${config.bot.owner}@s.whatsapp.net`]
    }, { quoted: msg });
  }
};
