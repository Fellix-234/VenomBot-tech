import { sendText } from '../modules/connection.js';

export default {
  name: 'gclink',
  aliases: ['grouplink', 'invitelink'],
  category: 'group',
  description: 'Get the group invite link',
  usage: '!gclink',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, isOwner, sock }) => {
    try {
      const groupMetadata = await sock.groupMetadata(fromJid);
      
      // Check if user is admin or owner
      const participant = groupMetadata.participants.find(p => p.id === msg.key.participant);
      const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
      
      if (!isOwner && !isAdmin) {
        await sendText(fromJid, '❌ Only group admins can use this command!', msg);
        return;
      }

      const code = await sock.groupInviteCode(fromJid);
      const link = `https://chat.whatsapp.com/${code}`;
      
      let text = `╭─「 *GROUP LINK* 」\n`;
      text += `│ *${groupMetadata.subject}*\n\n`;
      text += `│ 🔗 ${link}\n\n`;
      text += `│ 📝 Use this link to join the group\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to get group link. Please try again.', msg);
    }
  }
};
