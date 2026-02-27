import { sendText } from '../modules/connection.js';
import axios from 'axios';

export default {
  name: 'dog',
  aliases: ['dogpic', 'randomdog'],
  category: 'fun',
  description: 'Get a random dog image',
  usage: '!dog',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://dog.ceo/api/breeds/image/random');
      const imageUrl = response.data.message;
      
      const text = `🐕 *Random Dog Image*\n\n${imageUrl}`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch dog image', msg);
    }
  }
};
