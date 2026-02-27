import { sendText } from '../modules/connection.js';

export default {
  name: 'mock',
  aliases: ['sarcasm', 'mocking'],
  category: 'fun',
  description: 'Convert text to mocking spongebob case',
  usage: '!mock [text]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (!args.length) {
      await sendText(fromJid, '❌ Please provide text to mock\n\nExample: !mock this is funny', msg);
      return;
    }
    
    const text = args.join(' ');
    const mocked = text.split('').map((char, i) => 
      i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join('');
    
    let result = `😏 *Mocking SpongeBob*\n\n`;
    result += `Original: ${text}\n`;
    result += `Mocked: ${mocked}`;
    
    await sendText(fromJid, result, msg);
  }
};
