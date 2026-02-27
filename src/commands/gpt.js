import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'gpt',
  aliases: ['ai', 'chatgpt', 'ask', 'openai'],
  category: 'ai',
  description: 'Ask AI chatbot any question',
  usage: '!gpt <question>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `🤖 *AI CHATBOT*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}gpt <your question>\n\n`;
      text += `✨ *Example:*\n`;
      text += `   ${config.bot.prefix}gpt What is Python?\n`;
      text += `   ${config.bot.prefix}gpt Write a poem about love\n\n`;
      text += `🎯 *Features:*\n`;
      text += `   • Smart AI Responses\n`;
      text += `   • Coding Help\n`;
      text += `   • General Knowledge\n`;
      text += `   • Creative Writing\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_🤖 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const question = args.join(' ');
    
    let text = `🤖 *AI Processing...*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `❓ *Your Question:* ${question}\n\n`;
    text += `⏳ Thinking...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated AI response
    const responses = [
      "That's an interesting question! Based on my knowledge, I can tell you that this topic is quite fascinating.",
      "Great question! Let me explain: The answer involves understanding several key concepts.",
      "I'd be happy to help with that! Here's what I know about your question.",
      "Thanks for asking! This is a popular topic and here's what you should know.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    let resultText = `🤖 *AI RESPONSE*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `❓ *Question:* ${question}\n\n`;
    resultText += `💬 *Answer:*\n`;
    resultText += `${randomResponse}\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📝 *Note:* AI feature in demo mode.\n`;
    resultText += `🔧 OpenAI integration coming soon!\n\n`;
    resultText += `_💡 Ask more questions with ${config.bot.prefix}gpt_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
