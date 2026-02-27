import axios from 'axios';
import { sendText } from '../modules/connection.js';
import { config } from '../config.js';
import { cache } from '../utils/cache.js';

export default {
  name: 'chat',
  aliases: ['ai', 'ask', 'think'],
  category: 'utility',
  description: 'Chat with AI bot',
  usage: '!chat <message>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a message!\nUsage: !chat <message>', msg);
      return;
    }

    const userMessage = args.join(' ');
    
    try {
      await sendText(fromJid, '🤔 Thinking...', msg);
      
      // Check if OpenAI API key is configured
      const apiKey = config.apiKeys.openai;
      
      if (apiKey) {
        // Use OpenAI API
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful WhatsApp bot assistant.' },
              { role: 'user', content: userMessage }
            ],
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const aiResponse = response.data.choices[0].message.content;
        await sendText(fromJid, `🤖 ${aiResponse}`, msg);
      } else {
        // Fallback to free AI API
        const response = await axios.get(
          `https://api.simsimi.vn/v1/simtalk`,
          {
            params: {
              message: userMessage
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        const aiResponse = response.data.message || "I'm not sure how to respond to that.";
        await sendText(fromJid, `🤖 ${aiResponse}`, msg);
      }
    } catch (error) {
      // Fallback responses
      const fallbackResponses = [
        "I'm still learning! Try asking something else.",
        "That's an interesting question! Let me think about it...",
        "I don't have an answer for that right now.",
        "Could you try rephrasing your question?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      await sendText(fromJid, `🤖 ${randomResponse}`, msg);
    }
  }
};
