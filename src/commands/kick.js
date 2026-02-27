import { sendText, getSocket } from '../modules/connection.js';

export default {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  description: 'Kick a member from the group',
  usage: '!kick @user',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, sock, isGroup }) => {
    if (!isGroup) return;
    
    try {
      const socket = getSocket();
      const groupMetadata = await socket.groupMetadata(fromJid);
      const participants = groupMetadata.participants;
      const botNumber = socket.user.id.split(':')[0] + '@s.whatsapp.net';
      
      // Check if bot is admin
      const botAdmin = participants.find(p => p.id === botNumber)?.admin;
      if (!botAdmin) {
        await sendText(fromJid, '❌ Bot must be an admin to kick members!', msg);
        return;
      }
      
      // Get mentioned users
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      
      if (!mentioned || mentioned.length === 0) {
        await sendText(fromJid, '❌ Please mention the user to kick!\nUsage: !kick @user', msg);
        return;
      }
      
      // Kick all mentioned users
      for (const user of mentioned) {
        await socket.groupParticipantsUpdate(fromJid, [user], 'remove');
      }
      
      await sendText(fromJid, `✅ Successfully kicked ${mentioned.length} user(s)!`, msg);
      
    } catch (error) {
      await sendText(fromJid, `❌ Error: ${error.message}`, msg);
    }
  }
};
