import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'quote',
  aliases: ['quotes'],
  category: 'fun',
  description: 'Get an inspirational quote',
  usage: '!quote',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      
      const data = response.data;
      
      let text = `╭─「 *QUOTE* 」\n`;
      text += `│ "${data.content}"\n\n`;
      text += `│ — ${data.author}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      // Fallback quotes
      const fallbackQuotes = [
        { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { content: "Stay hungry, stay foolish.", author: "Steve Jobs" },
        { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" }
      ];
      
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      
      let text = `╭─「 *QUOTE* 」\n`;
      text += `│ "${randomQuote.content}"\n\n`;
      text += `│ — ${randomQuote.author}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    }
  }
};
