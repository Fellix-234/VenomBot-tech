import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

export default {
  name: 'status',
  aliases: ['settings', 'config'],
  category: 'utility',
  description: 'Show bot status and settings',
  usage: '!status',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    let text = `╭─「 *BOT STATUS* 」\n`;
    text += `│ \n`;
    text += `│ *AUTO SETTINGS*\n`;
    text += `│ • Auto Read: ${config.settings.autoRead ? '✅' : '❌'}\n`;
    text += `│ • Auto Type: ${config.settings.autoTyping ? '✅' : '❌'}\n`;
    text += `│ • Auto Record: ${config.settings.autoRecording ? '✅' : '❌'}\n`;
    text += `│ • Auto React: ${config.settings.autoReact ? '✅' : '❌'}\n`;
    text += `│ \n`;
    text += `│ *PROTECTION*\n`;
    text += `│ • Anti Link: ${config.settings.antiLink ? '✅' : '❌'}\n`;
    text += `│ • Anti Bot: ${config.settings.antiBot ? '✅' : '❌'}\n`;
    text += `│ \n`;
    text += `│ *BOT INFO*\n`;
    text += `│ • Name: ${config.bot.name}\n`;
    text += `│ • Version: ${config.bot.version}\n`;
    text += `│ • Prefix: ${config.bot.prefix}\n`;
    text += `╰────────────⦁`;
    
    // Try to send with status image
    try {
      const statusImage = path.join(assetsPath, 'WhatsApp Image 2026-02-27 at 15.42.22.jpeg');
      if (fs.existsSync(statusImage)) {
        const imageBuffer = fs.readFileSync(statusImage);
        await sendImage(fromJid, imageBuffer, text, msg);
      } else {
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      await sendText(fromJid, text, msg);
    }
  }
};
