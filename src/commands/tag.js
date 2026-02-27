import { sendText } from '../modules/connection.js';
import { getSocket } from '../modules/connection.js';

export default {
  name: 'tag',
  aliases: ['tagall', 'mention'],
  category: 'group',
  description: 'Tag all group members',
  usage: '!tag [message]',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, args, isGroup }) => {
    if (!isGroup) return;
    
    try {
      const sock = getSocket();
      const groupMetadata = await sock.groupMetadata(fromJid);
      const participants = groupMetadata.participants;
      
      const message = args.join(' ') || 'Attention everyone!';
      
      let text = `╭─「 *GROUP TAG* 」\n`;
      text += `│ ${message}\n`;
      text += `│\n`;
      
      const mentions = participants.map(p => p.id);
      
      participants.forEach((participant, index) => {
        const number = participant.id.split('@')[0];
        text += `│ ${index + 1}. @${number}\n`;
      });
      
      text += `╰────────────⦁`;
      
      await sock.sendMessage(fromJid, {
        text,
        mentions
      }, { quoted: msg });
      
    } catch (error) {
      await sendText(fromJid, `❌ Error: ${error.message}`, msg);
    }
  }
};
