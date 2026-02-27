import { sendText } from '../modules/connection.js';
import axios from 'axios';

export default {
  name: 'cat',
  aliases: ['catpic', 'randomcat'],
  category: 'fun',
  description: 'Get a random cat image',
  usage: '!cat',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://api.thecatapi.com/v1/images/search');
      const imageUrl = response.data[0].url;
      
      const text = `🐱 *Random Cat Image*\n\n${imageUrl}`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch cat image', msg);
    }
  }
};
