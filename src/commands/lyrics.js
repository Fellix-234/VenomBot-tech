import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'lyrics',
  aliases: ['lyric'],
  category: 'media',
  description: 'Get song lyrics',
  usage: '!lyrics <song name>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a song name!\nUsage: !lyrics <song name>', msg);
      return;
    }

    const songName = args.join(' ');
    
    try {
      await sendText(fromJid, `🔍 Searching for lyrics of "${songName}"...`, msg);
      
      // Using lyrics.ovh API (free)
      const response = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(songName)}`
      );
      
      const lyrics = response.data.lyrics;
      
      if (!lyrics) {
        await sendText(fromJid, `❌ No lyrics found for "${songName}"`, msg);
        return;
      }
      
      // Split lyrics if too long
      const maxLength = 400;
      if (lyrics.length > maxLength) {
        const part1 = lyrics.substring(0, maxLength);
        const part2 = lyrics.substring(maxLength);
        
        let text = `╭─「 *LYRICS: ${songName}* 」\n`;
        text += `│ Part 1:\n${part1}\n`;
        text += `╰────────────⦁`;
        await sendText(fromJid, text, msg);
        
        await sendText(fromJid, `Part 2:\n${part2}`, msg);
      } else {
        let text = `╭─「 *LYRICS: ${songName}* 」\n`;
        text += `│ ${lyrics}\n`;
        text += `╰────────────⦁`;
        await sendText(fromJid, text, msg);
      }
      
    } catch (error) {
      await sendText(fromJid, `❌ No lyrics found for "${songName}". Please try a different search.`, msg);
    }
  }
};
