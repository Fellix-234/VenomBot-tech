import { sendText } from '../modules/connection.js';

export default {
  name: 'calc',
  aliases: ['calculate', 'math'],
  category: 'utility',
  description: 'Perform basic mathematical calculations',
  usage: '!calc <expression>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a mathematical expression!\nUsage: !calc 2+2 or !calc 10*5', msg);
      return;
    }

    const expression = args.join(' ').replace(/[^0-9+\-*/().%]/g, '');
    
    if (!expression) {
      await sendText(fromJid, '❌ Invalid expression! Only numbers and operators (+, -, *, /, %, ()) are allowed.', msg);
      return;
    }

    try {
      // Safe math evaluation
      const result = Function('"use strict"; return (' + expression + ')')();
      
      if (isNaN(result) || !isFinite(result)) {
        await sendText(fromJid, '❌ Invalid calculation result!', msg);
        return;
      }

      const text = `╭─「 *CALCULATOR* 」\n`;
      text += `│ • *Expression:* ${expression}\n`;
      text += `│ • *Result:* ${result}\n`;
      text += `╰────────────⦁`;

      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Invalid expression! Please check your calculation.', msg);
    }
  }
};
