import { sendText } from '../modules/connection.js';

export default {
  name: 'dice',
  aliases: ['roll', 'rolldice'],
  category: 'fun',
  description: 'Roll a dice',
  usage: '!dice [sides] (default: 6)',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    const sides = parseInt(args[0]) || 6;
    
    if (sides < 2 || sides > 100) {
      await sendText(fromJid, '❌ Dice sides must be between 2 and 100', msg);
      return;
    }
    
    const result = Math.floor(Math.random() * sides) + 1;
    
    let text = `🎲 *Dice Roll*\n\n`;
    text += `Sides: ${sides}\n`;
    text += `Result: *${result}*`;
    
    await sendText(fromJid, text, msg);
  }
};
