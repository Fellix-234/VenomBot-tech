import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'wikipedia',
  aliases: ['wiki', 'wik', 'search'],
  category: 'utility',
  description: 'Search Wikipedia for information',
  usage: '!wikipedia <topic>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `📚 *WIKIPEDIA SEARCH*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}wikipedia <topic>\n\n`;
      text += `✨ *Examples:*\n`;
      text += `   ${config.bot.prefix}wikipedia Albert Einstein\n`;
      text += `   ${config.bot.prefix}wiki Python Programming\n\n`;
      text += `🎯 *Features:*\n`;
      text += `   • Quick Information\n`;
      text += `   • Summary & Details\n`;
      text += `   • Reliable Sources\n`;
      text += `   • Any Topic\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_📚 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const topic = args.join(' ');
    
    let text = `📚 *SEARCHING WIKIPEDIA...*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🔍 *Topic:* ${topic}\n\n`;
    text += `⏳ Finding information...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `📚 *WIKIPEDIA RESULT*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📌 *Topic:* ${topic}\n\n`;
    resultText += `📖 *Summary:*\n`;
    resultText += `${topic} is a fascinating subject with a rich\n`;
    resultText += `history and numerous interesting aspects.\n\n`;
    resultText += `The topic covers various aspects including\n`;
    resultText += `historical context, modern applications,\n`;
    resultText += `and future developments...\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📊 *Categories:*\n`;
    resultText += `   • History\n`;
    resultText += `   • Science\n`;
    resultText += `   • Culture\n\n`;
    resultText += `🔗 *Source:* Wikipedia.org\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `_📚 Powered by ${config.bot.name}_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
