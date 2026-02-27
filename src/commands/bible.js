import { sendText } from '../modules/connection.js';
import axios from 'axios';

export default {
  name: 'bible',
  aliases: ['verse', 'scripture'],
  category: 'utility',
  description: 'Get a random Bible verse',
  usage: '!bible',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://labs.bible.org/api/?passage=random&type=json');
      const verse = response.data[0];
      
      const text = `📖 *Bible Verse*\n\n` +
                  `"${verse.text}"\n\n` +
                  `— ${verse.bookname} ${verse.chapter}:${verse.verse}`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch Bible verse', msg);
    }
  }
};
