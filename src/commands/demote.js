import { sendText, getSocket } from '../modules/connection.js';

export default {
  name: 'demote',
  aliases: ['unadmin'],
  category: 'group',
  description: 'Demote admin to member',
  usage: '!demote @user',
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
        await sendText(fromJid, '❌ Bot must be an admin to demote members!', msg);
        return;
      }
      
      // Get mentioned users
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      
      if (!mentioned || mentioned.length === 0) {
        await sendText(fromJid, '❌ Please mention the user to demote!\nUsage: !demote @user', msg);
        return;
      }
      
      // Demote all mentioned users
      for (const user of mentioned) {
        await socket.groupParticipantsUpdate(fromJid, [user], 'demote');
      }
      
      await sendText(fromJid, `✅ Successfully demoted ${mentioned.length} user(s) to member!`, msg);
      
    } catch (error) {
      await sendText(fromJid, `❌ Error: ${error.message}`, msg);
    }
  }
};
