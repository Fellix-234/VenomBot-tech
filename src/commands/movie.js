import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'movie',
  aliases: ['film', 'movies', 'imdb'],
  category: 'entertainment',
  description: 'Get movie information and details',
  usage: '!movie <movie name>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `🎬 *MOVIE SEARCH*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📥 *Usage:* ${config.bot.prefix}movie <movie name>\n\n`;
      text += `✨ *Example:*\n`;
      text += `   ${config.bot.prefix}movie Avengers Endgame\n\n`;
      text += `🎯 *Features:*\n`;
      text += `   • Movie Information\n`;
      text += `   • Ratings & Reviews\n`;
      text += `   • Cast & Crew\n`;
      text += `   • Trailers\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_🎭 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const movieName = args.join(' ');
    
    let text = `🎬 *Searching for:* "${movieName}"\n\n`;
    text += `⏳ Please wait...\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🔍 Searching IMDB database...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `🎬 *Movie Found!*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📌 *Title:* ${movieName}\n`;
    resultText += `📅 *Year:* 2024\n`;
    resultText += `⭐ *Rating:* 8.5/10\n`;
    resultText += `⏱️ *Runtime:* 2h 30m\n`;
    resultText += `🎭 *Genre:* Action, Adventure, Sci-Fi\n\n`;
    resultText += `📖 *Plot:*\n`;
    resultText += `An epic adventure across the universe...\n\n`;
    resultText += `👥 *Cast:*\n`;
    resultText += `   • Actor 1 as Hero\n`;
    resultText += `   • Actor 2 as Villain\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `🎯 *Status:* Demo Mode\n`;
    resultText += `_🔧 Full IMDB integration coming soon!_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
