import { sendText, getSocket } from '../modules/connection.js';

export default {
  name: 'groupinfo',
  aliases: ['ginfo', 'groupdetails'],
  category: 'group',
  description: 'Get group information',
  usage: '!groupinfo',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, isGroup }) => {
    if (!isGroup) return;
    
    try {
      const socket = getSocket();
      const groupMetadata = await socket.groupMetadata(fromJid);
      
      const participants = groupMetadata.participants;
      const admins = participants.filter(p => p.admin).length;
      const members = participants.length - admins;
      
      let text = `╭─「 *GROUP INFO* 」\n`;
      text += `│\n`;
      text += `│ • *Name:* ${groupMetadata.subject}\n`;
      text += `│ • *Group ID:* ${fromJid.split('@')[0]}\n`;
      text += `│ • *Created:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n`;
      text += `│ • *Owner:* @${groupMetadata.owner.split('@')[0]}\n`;
      text += `│\n`;
      text += `├─「 *MEMBERS* 」\n`;
      text += `│\n`;
      text += `│ • *Total:* ${participants.length}\n`;
      text += `│ • *Admins:* ${admins}\n`;
      text += `│ • *Members:* ${members}\n`;
      text += `│\n`;
      text += `├─「 *SETTINGS* 」\n`;
      text += `│\n`;
      text += `│ • *Announce:* ${groupMetadata.announce ? 'Only Admins' : 'All Members'}\n`;
      text += `│ • *Restrict:* ${groupMetadata.restrict ? 'Only Admins' : 'All Members'}\n`;
      text += `│\n`;
      text += `╰────────────⦁`;
      
      if (groupMetadata.desc) {
        text += `\n\n*Description:*\n${groupMetadata.desc}`;
      }
      
      await socket.sendMessage(fromJid, {
        text,
        mentions: [groupMetadata.owner]
      }, { quoted: msg });
      
    } catch (error) {
      await sendText(fromJid, `❌ Error: ${error.message}`, msg);
    }
  }
};
