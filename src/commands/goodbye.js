import { sendText } from '../modules/connection.js';
import { cache } from '../utils/cache.js';

export default {
  name: 'goodbye',
  aliases: ['leave', 'setgoodbye'],
  category: 'group',
  description: 'Set goodbye message for group',
  usage: '!goodbye <message>',
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
      // Show current goodbye message
      const goodbye = cache.get(`goodbye_${fromJid}`);
      if (goodbye) {
        await sendText(fromJid, `Current goodbye message:\n\n${goodbye}`, msg);
      } else {
        await sendText(fromJid, 'No goodbye message set. Use !goodbye <message> to set one.', msg);
      }
      return;
    }

    const goodbyeMsg = args.join(' ');
    cache.set(`goodbye_${fromJid}`, goodbyeMsg);
    
    let text = `╭─「 *GOODBYE* 」\n`;
    text += `│ ✅ Goodbye message set!\n`;
    text += `│ ${goodbyeMsg}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
