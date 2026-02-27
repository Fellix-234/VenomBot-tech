import { sendText } from '../modules/connection.js';
import { cache } from '../utils/cache.js';

export default {
  name: 'welcome',
  aliases: ['setwelcome'],
  category: 'group',
  description: 'Set welcome message for group',
  usage: '!welcome <message>',
  ownerOnly: false,
  groupOnly: true,
  
  execute: async ({ fromJid, args, msg, sock, isOwner }) => {
    const groupMetadata = await sock.groupMetadata(fromJid);
    const participant = groupMetadata.participants.find(p => p.id === msg.key.participant);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      await sendText(fromJid, '❌ Only group admins can use this command!', msg);
      return;
    }

    if (args.length === 0) {
      // Show current welcome message
      const welcome = cache.get(`welcome_${fromJid}`);
      if (welcome) {
        await sendText(fromJid, `Current welcome message:\n\n${welcome}`, msg);
      } else {
        await sendText(fromJid, 'No welcome message set. Use !welcome <message> to set one.', msg);
      }
      return;
    }

    const welcomeMsg = args.join(' ');
    cache.set(`welcome_${fromJid}`, welcomeMsg);
    
    let text = `╭─「 *WELCOME* 」\n`;
    text += `│ ✅ Welcome message set!\n`;
    text += `│ ${welcomeMsg}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
