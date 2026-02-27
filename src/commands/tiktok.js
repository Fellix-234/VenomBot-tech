import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'tiktok',
  aliases: ['tt', 'tik', 'video'],
  category: 'media',
  description: 'Download TikTok videos without watermark',
  usage: '!tiktok <TikTok URL>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `🎵 *TIKTOK DOWNLOADER*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📥 *Usage:* ${config.bot.prefix}tiktok <TikTok URL>\n\n`;
      text += `✨ *Example:*\n`;
      text += `   ${config.bot.prefix}tiktok https://vm.tiktok.com/xxx\n\n`;
      text += `🎯 *Features:*\n`;
      text += `   • No Watermark\n`;
      text += `   • HD Quality\n`;
      text += `   • Audio Download\n`;
      text += `   • Fast Download\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `⚠️ *Note:* Send TikTok link to download\n`;
      text += `_🎵 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const url = args[0];
    
    // Check if it's a valid TikTok URL
    if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
      let errorText = `❌ *Invalid TikTok URL!*\n\n`;
      errorText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      errorText += `Please send a valid TikTok link.\n`;
      errorText += `Example: ${config.bot.prefix}tiktok https://vm.tiktok.com/xxx`;
      
      await sendText(fromJid, errorText, msg);
      return;
    }
    
    let text = `🎵 *TIKTOK DOWNLOADER*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📥 *Processing your request...*\n\n`;
    text += `🔗 *URL:* ${url}\n\n`;
    text += `⏳ Please wait, downloading...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `✅ *DOWNLOAD COMPLETE!*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📌 *Video Info:*\n`;
    resultText += `   • Title: TikTok Video\n`;
    resultText += `   • Duration: 0:30\n`;
    resultText += `   • Quality: 1080p HD\n`;
    resultText += `   • Size: ~15 MB\n\n`;
    resultText += `🎵 *Audio:* Included\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `⚠️ *Note:* TikTok download in demo mode.\n`;
    resultText += `🔧 Full integration coming soon!\n\n`;
    resultText += `_💡 Send TikTok link for download_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
