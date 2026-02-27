import { sendText } from '../modules/connection.js';
import axios from 'axios';

export default {
  name: 'advice',
  aliases: ['advise', 'tip'],
  category: 'fun',
  description: 'Get random life advice',
  usage: '!advice',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://api.adviceslip.com/advice');
      const advice = response.data.slip.advice;
      
      const text = `💡 *Random Advice*\n\n"${advice}"`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch advice', msg);
    }
  }
};
