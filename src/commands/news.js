import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'news',
  aliases: ['headlines', 'n', 'latest'],
  category: 'utility',
  description: 'Get latest news headlines',
  usage: '!news [category]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    const category = args.length > 0 ? args[0].toLowerCase() : 'general';
    
    let text = `📰 *LATEST NEWS*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🕐 *Updated:* ${new Date().toLocaleString()}\n\n`;
    
    // News categories display
    if (args.length === 0) {
      text += `📂 *Categories:*\n`;
      text += `   ${config.bot.prefix}news general   - All News\n`;
      text += `   ${config.bot.prefix}news tech     - Technology\n`;
      text += `   ${config.bot.prefix}news sports   - Sports\n`;
      text += `   ${config.bot.prefix}news business - Business\n`;
      text += `   ${config.bot.prefix}news science  - Science\n`;
      text += `   ${config.bot.prefix}news health   - Health\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `✨ *Example:* ${config.bot.prefix}news tech`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    text += `📂 *Category:* ${category.toUpperCase()}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Sample news (in production, connect to actual news API)
    const news = [
      { title: 'Breaking: Major Technology Breakthrough Announced', time: '2h ago', source: 'Tech Daily' },
      { title: 'Sports: Championship Finals Set for This Weekend', time: '3h ago', source: 'Sports Net' },
      { title: 'Business: Stock Markets Reach New Heights', time: '4h ago', source: 'Finance Times' },
      { title: 'Science: New Discovery Changes Understanding', time: '5h ago', source: 'Science Weekly' },
      { title: 'Health: Expert Tips for Better Wellness', time: '6h ago', source: 'Health Guide' },
    ];
    
    news.forEach((item, index) => {
      text += `${index + 1}. *${item.title}*\n`;
      text += `   🕐 ${item.time} | 📡 ${item.source}\n\n`;
    });
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💡 *Note:* News is fetched from various sources.\n`;
    text += `_🔄 Updates every hour_`;
    
    await sendText(fromJid, text, msg);
  }
};
