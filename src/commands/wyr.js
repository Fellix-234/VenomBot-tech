import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'wyr',
  aliases: ['wouldyou', 'choose'],
  category: 'fun',
  description: 'Would You Rather - Fun game',
  usage: '!wyr',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const scenarios = [
      { a: 'Have unlimited money', b: 'Have unlimited time' },
      { a: 'Be able to fly', b: 'Be invisible' },
      { a: 'Live in the past', b: 'Live in the future' },
      { a: 'Be famous', b: 'Be the best friend of someone famous' },
      { a: 'Have a rewind button', b: 'Have a pause button for your life' },
      { a: 'Be able to talk to animals', b: 'Speak all human languages' },
      { a: 'Live in a mansion', b: 'Travel the world in luxury' },
      { a: 'Have super strength', b: 'Have super speed' },
      { a: 'Always be 10 minutes late', b: 'Always be 20 minutes early' },
      { a: 'Be the smartest person', b: 'Be the happiest person' },
      { a: 'Have no phone', b: 'Have no computer' },
      { a: 'Be able to teleport', b: 'Be able to read minds' },
      { a: 'Live forever', b: 'know the date of your death' },
      { a: 'Have a personal chef', b: 'Have a personal driver' },
      { a: 'Be able to see the future', b: 'Be able to change the past' },
    ];
    
    const random = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    let text = `🎯 *WOULD YOU RATHER?*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `A) *${random.a}*\n\n`;
    text += `OR\n\n`;
    text += `B) *${random.b}*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💬 *Reply with A or B!*\n\n`;
    text += `_🎮 Powered by ${config.bot.name}_`;
    
    await sendText(fromJid, text, msg);
  }
};
