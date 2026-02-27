import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

export default {
  name: 'repo',
  aliases: ['github', 'source'],
  category: 'general',
  description: 'Show bot repository information',
  usage: '!repo',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    let text = "*VenomBot REPO*\n\n";
    text += "VenomBot Tech\n";
    text += "Professional WhatsApp Bot\n\n";
    text += "*Features:*\n";
    text += "- Group Management\n";
    text += "- Fun & Utilities\n";
    text += "- AI Chat\n";
    text += "- Media Tools\n";
    text += "- Anti-Delete\n";
    text += "- Auto Reactions\n";
    text += "- And More...\n\n";
    text += "*Info:*\n";
    text += "- Version: " + config.bot.version + "\n";
    text += "- Prefix: " + config.bot.prefix + "\n";
    text += "- GitHub: https://github.com/Fellix-234/VenomBot-Tech\n";
    text += "- Made with love";
    
    // Try to send with repo image
    try {
      const repoImage = path.join(assetsPath, 'WhatsApp Image 2026-02-27 at 15.42.23.jpeg');
      if (fs.existsSync(repoImage)) {
        const imageBuffer = fs.readFileSync(repoImage);
        await sendImage(fromJid, imageBuffer, text, msg);
      } else {
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      await sendText(fromJid, text, msg);
    }
  }
};
