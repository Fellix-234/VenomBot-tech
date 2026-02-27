import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

export default {
  name: 'alive',
  aliases: ['bot', 'online'],
  category: 'general',
  description: 'Check if bot is alive',
  usage: '!alive',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      // Get random image from assets folder
      const files = fs.readdirSync(assetsPath).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
      
      let imagePath;
      if (files.length > 0) {
        const randomImage = files[Math.floor(Math.random() * files.length)];
        imagePath = path.join(assetsPath, randomImage);
      }
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      let text = `╭─「 *${config.bot.name} IS ALIVE* 」\n`;
      text += `│ \n`;
      text += `│ 👋 Hello! I'm running perfectly!\n`;
      text += `│ \n`;
      text += `│ ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n`;
      text += `│ 📱 *Status:* Online ✅\n`;
      text += `│ 🏷️ *Version:* ${config.bot.version}\n`;
      text += `│ \n`;
      text += `│ Type ${config.bot.prefix}help for commands\n`;
      text += `╰────────────⦁`;
      
      if (imagePath && fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        await sendImage(fromJid, imageBuffer, text, msg);
      } else {
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      let text = `╭─「 *${config.bot.name} IS ALIVE* 」\n`;
      text += `│ 👋 Hello! I'm running perfectly!\n`;
      text += `│ 📱 Status: Online ✅\n`;
      text += `│ Version: ${config.bot.version}\n`;
      text += `╰────────────⦁`;
      await sendText(fromJid, text, msg);
    }
  }
};
