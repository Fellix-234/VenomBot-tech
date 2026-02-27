import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'antilink',
  aliases: ['antlink'],
  category: 'settings',
  description: 'Toggle anti-link protection',
  usage: '!antilink',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, msg, isOwner, sock }) => {
    // Check admin permissions
    const groupMetadata = await sock.groupMetadata(fromJid);
    const participant = groupMetadata.participants.find(p => p.id === msg.key.participant);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      await sendText(fromJid, '❌ Only group admins can use this command!', msg);
      return;
    }

    config.settings.antiLink = !config.settings.antiLink;
    
    let text = `╭─「 *ANTILINK* 」\n`;
    text += `│ ${config.settings.antiLink ? '✅ Enabled' : '❌ Disabled'}\n`;
    text += `│ Links will be ${config.settings.antiLink ? 'deleted' : 'allowed'}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
