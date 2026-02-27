import { getGroupMetadata, sendText } from '../modules/connection.js';

export default {
  name: 'unmute',
  aliases: ['unsilence'],
  category: 'group',
  description: 'Unmute the group (all members can send messages)',
  usage: '!unmute',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, isOwner, sock }) => {
    try {
      const groupMetadata = await getGroupMetadata(fromJid);
      
      // Check if user is admin or owner
      const participant = groupMetadata.participants.find(p => p.id === msg.key.participant);
      const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
      
      if (!isOwner && !isAdmin) {
        await sendText(fromJid, '❌ Only group admins can use this command!', msg);
        return;
      }

      await sock.groupSettingUpdate(fromJid, 'not_announcement');
      
      let text = `╭─「 *GROUP UNMUTED* 」\n`;
      text += `│ ✅ Group has been unmuted!\n`;
      text += `│ All members can send messages now.\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to unmute group. Please try again.', msg);
    }
  }
};
