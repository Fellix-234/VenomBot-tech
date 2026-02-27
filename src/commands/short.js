import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'short',
  aliases: ['shorten', 'shrink'],
  category: 'utility',
  description: 'Shorten a URL',
  usage: '!short <url>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a URL to shorten!\nUsage: !short <url>', msg);
      return;
    }

    const url = args[0];
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      await sendText(fromJid, '❌ Please provide a valid URL starting with http:// or https://', msg);
      return;
    }
    
    try {
      // Using is.gd API (free, no API key needed)
      const response = await axios.get(
        `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
      );
      
      const shortUrl = response.data;
      
      let text = `╭─「 *URL SHORTENED* 」\n`;
      text += `│ Original: ${url}\n`;
      text += `│ Short: ${shortUrl}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to shorten URL. Please try again.', msg);
    }
  }
};
