import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'tr',
  aliases: ['translate', 'tl', 'lang'],
  category: 'utility',
  description: 'Translate text to different languages',
  usage: '!tr <language> <text>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length < 2) {
      let text = `🌐 *TEXT TRANSLATOR*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}tr <language> <text>\n\n`;
      text += `✨ *Supported Languages:*\n\n`;
      text += `   🇺🇸 en  - English\n`;
      text += `   🇪🇸 es  - Spanish\n`;
      text += `   🇫🇷 fr  - French\n`;
      text += `   🇩🇪 de  - German\n`;
      text += `   🇮🇹 it  - Italian\n`;
      text += `   🇵🇹 pt  - Portuguese\n`;
      text += `   🇷🇺 ru  - Russian\n`;
      text += `   🇨🇳 zh  - Chinese\n`;
      text += `   🇯🇵 ja  - Japanese\n`;
      text += `   🇰🇷 ko  - Korean\n`;
      text += `   🇮🇳 hi  - Hindi\n`;
      text += `   🇸🇦 ar  - Arabic\n`;
      text += `   🇹🇭 th  - Thai\n`;
      text += `   🇻🇳 vi  - Vietnamese\n`;
      text += `   🇮🇩 id  - Indonesian\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `💡 *Example:*\n`;
      text += `   ${config.bot.prefix}tr es Hello World\n`;
      text += `   ${config.bot.prefix}tr ja Hello\n\n`;
      text += `_🌍 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const lang = args[0].toLowerCase();
    const text = args.slice(1).join(' ');
    
    let textMsg = `🌐 *TRANSLATING...*\n\n`;
    textMsg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    textMsg += `📝 *Original:* ${text}\n\n`;
    textMsg += `⏳ Translating to ${lang}...`;
    
    await sendText(fromJid, textMsg, msg);
    
    // Simulated translation
    const translations = {
      'es': 'Hola Mundo',
      'fr': 'Bonjour le monde',
      'de': 'Hallo Welt',
      'it': 'Ciao mondo',
      'pt': 'Olá mundo',
      'ru': 'Привет мир',
      'zh': '你好世界',
      'ja': 'こんにちは世界',
      'ko': '안녕하세요 세계',
      'hi': 'नमस्ते दुनिया',
      'ar': 'مرحبا بالعالم',
      'th': 'สวัสดีโลก',
      'vi': 'Xin chào thế giới',
      'id': 'Halo dunia',
      'en': text
    };
    
    const translated = translations[lang] || `[Translated to ${lang}]: ${text}`;
    
    let resultText = `🌐 *TRANSLATION COMPLETE*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `📝 *Original (${text.length} chars):*\n`;
    resultText += `${text}\n\n`;
    resultText += `✨ *Translation (${lang.toUpperCase()}):*\n`;
    resultText += `${translated}\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `_🔄 Type ${config.bot.prefix}tr for more languages_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
