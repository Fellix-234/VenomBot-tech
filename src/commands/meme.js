import axios from 'axios';
import { sendText, sendImage } from '../modules/connection.js';

export default {
  name: 'meme',
  aliases: ['memes'],
  category: 'fun',
  description: 'Get a random meme',
  usage: '!meme',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      await sendText(fromJid, '🔍 Finding a funny meme...', msg);
      
      // Using Reddit API for memes
      const response = await axios.get('https://www.reddit.com/r/memes/random.json', {
        headers: { 'User-Agent': 'VenomBot/2.0' }
      });
      
      const data = response.data[0].data.children[0].data;
      const title = data.title;
      const imageUrl = data.url;
      
      // Check if it's an image
      if (imageUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        await sendImage(fromJid, { url: imageUrl }, `*${title}*`, msg);
      } else {
        // If not an image, send as text
        let text = `╭─「 *MEME* 」\n`;
        text += `│ *${title}*\n\n`;
        text += `│ 🔗 ${imageUrl}\n`;
        text += `╰────────────⦁`;
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch meme. Please try again!', msg);
    }
  }
};
