import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'youtube',
  aliases: ['yt', 'video'],
  category: 'media',
  description: 'Search for YouTube videos',
  usage: '!youtube <query>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a search query!\nUsage: !youtube <query>', msg);
      return;
    }

    const query = args.join(' ');
    
    try {
      await sendText(fromJid, `🔍 Searching for "${query}" on YouTube...`, msg);
      
      // Using Invidious API (free, no API key needed)
      const response = await axios.get(
        `https://invidious.jingl.xyz/api/v1/search?q=${encodeURIComponent(query)}&type=video&limit=5`
      );
      
      const videos = response.data;
      
      if (!videos || videos.length === 0) {
        await sendText(fromJid, `❌ No videos found for "${query}"`, msg);
        return;
      }
      
      let text = `╭─「 *YOUTUBE SEARCH* 」\n`;
      text += `│ Query: ${query}\n`;
      text += `╰────────────⦁\n\n`;
      
      for (let i = 0; i < Math.min(videos.length, 5); i++) {
        const video = videos[i];
        const duration = video.lengthSeconds ? `${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}` : 'N/A';
        
        text += `${i + 1}. *${video.title}*\n`;
        text += `   👁️ ${video.viewCount || 0} views • ⏱️ ${duration}\n`;
        text += `   🔗 https://youtu.be/${video.videoId}\n\n`;
      }
      
      await sendText(fromJid, text, msg);
      
    } catch (error) {
      // Fallback to Google search
      let text = `╭─「 *YOUTUBE SEARCH* 」\n`;
      text += `│ Search: ${query}\n\n`;
      text += `│ 🔗 Search on YouTube:\n`;
      text += `│ https://www.youtube.com/results?search_query=${encodeURIComponent(query)}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    }
  }
};
