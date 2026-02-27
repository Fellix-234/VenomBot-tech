import { sendText } from '../modules/connection.js';

export default {
  name: 'flip',
  aliases: ['coin', 'coinflip', 'toss'],
  category: 'fun',
  description: 'Flip a coin',
  usage: '!flip',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🎯';
    
    let text = `${emoji} *Coin Flip*\n\n`;
    text += `Result: *${result}*`;
    
    await sendText(fromJid, text, msg);
  }
};
