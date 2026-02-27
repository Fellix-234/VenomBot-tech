import { sendText, getSocket } from '../modules/connection.js';
import { config } from '../config.js';
import { cache } from '../utils/cache.js';

export default {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Broadcast message to all contacts (owner only)',
  usage: '!broadcast <message>',
  ownerOnly: true,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a message to broadcast!\nUsage: !broadcast <message>', msg);
      return;
    }

    const message = args.join(' ');
    const sock = getSocket();
    
    try {
      await sendText(fromJid, '📤 Starting broadcast...', msg);
      
      // Get contacts from cache
      const contacts = cache.get('contacts') || [];
      
      if (contacts.length === 0) {
        await sendText(fromJid, '⚠️ No contacts found. Please wait for contacts to load.', msg);
        return;
      }
      
      let success = 0;
      let failed = 0;
      
      for (const contact of contacts) {
        try {
          await sendText(contact, `📢 *BROADCAST*\n\n${message}`, msg);
          success++;
        } catch (e) {
          failed++;
        }
      }
      
      let text = `╭─「 *BROADCAST COMPLETE* 」\n`;
      text += `│ ✅ Sent: ${success}\n`;
      text += `│ ❌ Failed: ${failed}\n`;
      text += `│ 📊 Total: ${contacts.length}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
      
    } catch (error) {
      await sendText(fromJid, '❌ Failed to broadcast. Please try again.', msg);
    }
  }
};
