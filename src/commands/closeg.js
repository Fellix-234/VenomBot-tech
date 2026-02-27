import { getGroupMetadata, sendText } from '../modules/connection.js';

export default {
  name: 'closeg',
  aliases: ['closegroup', 'lockgroup'],
  category: 'group',
  description: 'Close the group (only admins can send messages)',
  usage: '!closeg',
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

      await sock.groupSettingUpdate(fromJid, 'announcement');
      
      let text = `╭─「 *GROUP CLOSED* 」\n`;
      text += `│ ✅ Group has been closed!\n`;
      text += `│ Only admins can now send messages.\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to close group. Please try again.', msg);
    }
  }
};
