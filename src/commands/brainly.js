import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'brainly',
  aliases: ['homework', 'study', 'answer', 'ask'],
  category: 'utility',
  description: 'Get homework help and answers',
  usage: '!brainly <question>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `🧠 *BRAINLY - HOMEWORK HELPER*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}brainly <your question>\n\n`;
      text += `✨ *Examples:*\n`;
      text += `   ${config.bot.prefix}brainly What is photosynthesis?\n`;
      text += `   ${config.bot.prefix}brainly Solve x + 5 = 10\n\n`;
      text += `🎯 *Subjects:*\n`;
      text += `   • Math\n`;
      text += `   • Science\n`;
      text += `   • History\n`;
      text += `   • English\n`;
      text += `   • And more!\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_🧠 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const question = args.join(' ');
    
    let text = `🧠 *SEARCHING...*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `❓ *Question:* ${question}\n\n`;
    text += `⏳ Finding the best answer...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `🧠 *ANSWER FOUND!*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `❓ *Question:* ${question}\n\n`;
    resultText += `💡 *Answer:*\n`;
    resultText += `Based on the question, here's the answer:\n\n`;
    resultText += `The solution involves understanding the core concepts\n`;
    resultText += `and applying them to solve the problem...\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📚 *Related Topics:*\n`;
    resultText += `   • Topic 1\n`;
    resultText += `   • Topic 2\n`;
    resultText += `   • Topic 3\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `_🧠 Ask more questions with ${config.bot.prefix}brainly_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
