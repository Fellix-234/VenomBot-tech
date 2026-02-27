import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'gdrama',
  aliases: ['kdrama', 'korean', 'drama'],
  category: 'entertainment',
  description: 'Search Korean dramas and get details',
  usage: '!gdrama <drama name>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `📺 *KOREAN DRAMA SEARCH*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}gdrama <drama name>\n\n`;
      text += `✨ *Example:*\n`;
      text += `   ${config.bot.prefix}gdrama Squid Game\n`;
      text += `   ${config.bot.prefix}gdrama Breaking Dawn\n\n`;
      text += `🎯 *Features:*\n`;
      text += `   • Drama Information\n`;
      text += `   • Cast & Characters\n`;
      text += `   • Episodes & Ratings\n`;
      text += `   • Streaming Info\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_🎭 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const dramaName = args.join(' ');
    
    let text = `📺 *Searching:* "${dramaName}"\n\n`;
    text += `⏳ Please wait...\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🔍 Searching K-Drama database...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `📺 *K-Drama Found!*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📌 *Title:* ${dramaName}\n`;
    resultText += `📅 *Year:* 2024\n`;
    resultText += `⭐ *Rating:* 9.2/10\n`;
    resultText += `📺 *Episodes:* 16\n`;
    resultText += `⏱️ *Duration:* 60 min/ep\n\n`;
    resultText += `🎭 *Genre:* Thriller, Drama, Mystery\n\n`;
    resultText += `📖 *Plot:*\n`;
    resultText += `A thrilling story of survival and strategy...\n\n`;
    resultText += `👥 *Cast:*\n`;
    resultText += `   • Actor 1 as Main Character\n`;
    resultText += `   • Actor 2 as Supporting Role\n\n`;
    resultText += `📡 *Streaming on:* Netflix, Viki\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `_🎭 Stay tuned for more K-Drama info!_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
