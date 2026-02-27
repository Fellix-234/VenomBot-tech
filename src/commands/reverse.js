import { sendText } from '../modules/connection.js';

export default {
  name: 'reverse',
  aliases: ['rev', 'flip'],
  category: 'fun',
  description: 'Reverse text',
  usage: '!reverse [text]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (!args.length) {
      await sendText(fromJid, '❌ Please provide text to reverse\n\nExample: !reverse Hello World', msg);
      return;
    }
    
    const text = args.join(' ');
    const reversed = text.split('').reverse().join('');
    
    let result = `🔄 *Reversed Text*\n\n`;
    result += `Original: ${text}\n`;
    result += `Reversed: ${reversed}`;
    
    await sendText(fromJid, result, msg);
  }
};
