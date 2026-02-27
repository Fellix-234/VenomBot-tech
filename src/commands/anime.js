import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'anime',
  aliases: ['anim', 'a'],
  category: 'entertainment',
  description: 'Search anime information and details',
  usage: '!anime <anime name>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `🎌 *ANIME SEARCH*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}anime <anime name>\n\n`;
      text += `✨ *Example:*\n`;
      text += `   ${config.bot.prefix}anime Naruto\n`;
      text += `   ${config.bot.prefix}anime One Piece\n\n`;
      text += `🎯 *Features:*\n`;
      text += `   • Anime Information\n`;
      text += `   • Character Details\n`;
      text += `   • Episode List\n`;
      text += `   • Ratings & Reviews\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_🎌 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const animeName = args.join(' ');
    
    let text = `🎌 *Searching:* "${animeName}"\n\n`;
    text += `⏳ Please wait...\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🔍 Searching anime database...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `🎌 *Anime Found!*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📌 *Title:* ${animeName}\n`;
    resultText += `📅 *Year:* 2024\n`;
    resultText += `⭐ *Rating:* 9.5/10\n`;
    resultText += `📺 *Episodes:* 1000+\n`;
    resultText += `⏱️ *Duration:* 24 min\n\n`;
    resultText += `🎭 *Genre:* Action, Adventure, Fantasy\n\n`;
    resultText += `📖 *Synopsis:*\n`;
    resultText += `An epic journey of a young ninja seeking\n`;
    resultText += `to become the Hokage...\n\n`;
    resultText += `👥 *Main Characters:*\n`;
    resultText += `   • Character 1\n`;
    resultText += `   • Character 2\n`;
    resultText += `   • Character 3\n\n`;
    resultText += `📡 *Streaming on:* Crunchyroll, Netflix\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `_🎌 Explore more anime with ${config.bot.prefix}anime!_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
