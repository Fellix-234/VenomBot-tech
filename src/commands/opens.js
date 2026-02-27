import { getGroupMetadata, sendText } from '../modules/connection.js';

export default {
  name: 'opens',
  aliases: ['opengroup', 'unlockgroup'],
  category: 'group',
  description: 'Open the group (all members can send messages)',
  usage: '!opens',
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
      
      let text = `╭─「 *GROUP OPENED* 」\n`;
      text += `│ ✅ Group has been opened!\n`;
      text += `│ All members can now send messages.\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to open group. Please try again.', msg);
    }
  }
};
