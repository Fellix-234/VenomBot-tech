import { sendText, getSocket } from '../modules/connection.js';

export default {
  name: 'promote',
  aliases: ['admin'],
  category: 'group',
  description: 'Promote member to admin',
  usage: '!promote @user',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, isGroup }) => {
    if (!isGroup) return;
    
    try {
      const socket = getSocket();
      const groupMetadata = await socket.groupMetadata(fromJid);
      const participants = groupMetadata.participants;
      const botNumber = socket.user.id.split(':')[0] + '@s.whatsapp.net';
      
      // Check if bot is admin
      const botAdmin = participants.find(p => p.id === botNumber)?.admin;
      if (!botAdmin) {
        await sendText(fromJid, '❌ Bot must be an admin to promote members!', msg);
        return;
      }
      
      // Get mentioned users
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      
      if (!mentioned || mentioned.length === 0) {
        await sendText(fromJid, '❌ Please mention the user to promote!\nUsage: !promote @user', msg);
        return;
      }
      
      // Promote all mentioned users
      for (const user of mentioned) {
        await socket.groupParticipantsUpdate(fromJid, [user], 'promote');
      }
      
      await sendText(fromJid, `✅ Successfully promoted ${mentioned.length} user(s) to admin!`, msg);
      
    } catch (error) {
      await sendText(fromJid, `❌ Error: ${error.message}`, msg);
    }
  }
};
