import { sendText, getSocket } from '../modules/connection.js';

export default {
  name: 'delete',
  aliases: ['del'],
  category: 'general',
  description: 'Delete bot message',
  usage: '!delete (reply to bot message)',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo;
      
      if (!quoted || !quoted.participant) {
        await sendText(fromJid, '❌ Please reply to a bot message to delete it!', msg);
        return;
      }
      
      const socket = getSocket();
      const botNumber = socket.user.id.split(':')[0] + '@s.whatsapp.net';
      
      // Check if the quoted message is from the bot
      if (quoted.participant !== botNumber && !quoted.participant.includes(socket.user.id.split(':')[0])) {
        await sendText(fromJid, '❌ I can only delete my own messages!', msg);
        return;
      }
      
      await socket.sendMessage(fromJid, {
        delete: {
          remoteJid: fromJid,
          fromMe: true,
          id: quoted.stanzaId,
          participant: quoted.participant
        }
      });
      
    } catch (error) {
      await sendText(fromJid, `❌ Error: ${error.message}`, msg);
    }
  }
};
