import { sendText } from '../modules/connection.js';
import { cache } from '../utils/cache.js';

export default {
  name: 'afk',
  aliases: ['away'],
  category: 'general',
  description: 'Set AFK status',
  usage: '!afk [reason]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, sender, args }) => {
    const reason = args.join(' ') || 'No reason provided';
    
    cache.set(`afk_${sender}`, {
      reason,
      time: Date.now()
    }, 86400); // 24 hours
    
    await sendText(fromJid, `✅ AFK Status Set\n\n• *Reason:* ${reason}\n• *Time:* ${new Date().toLocaleString()}`, msg);
  }
};
