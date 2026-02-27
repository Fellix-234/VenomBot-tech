import { sendText } from '../modules/connection.js';

export default {
  name: 'choose',
  aliases: ['pick', 'select', 'decide'],
  category: 'fun',
  description: 'Choose randomly between options',
  usage: '!choose [option1] | [option2] | [option3]...',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (!args.length) {
      await sendText(fromJid, '❌ Please provide options separated by |\n\nExample: !choose pizza | burger | pasta', msg);
      return;
    }
    
    const text = args.join(' ');
    const options = text.split('|').map(opt => opt.trim()).filter(opt => opt);
    
    if (options.length < 2) {
      await sendText(fromJid, '❌ Please provide at least 2 options separated by |\n\nExample: !choose pizza | burger | pasta', msg);
      return;
    }
    
    const chosen = options[Math.floor(Math.random() * options.length)];
    
    let result = `🎯 *Random Choice*\n\n`;
    result += `Options: ${options.length}\n`;
    result += `I choose: *${chosen}*`;
    
    await sendText(fromJid, result, msg);
  }
};
