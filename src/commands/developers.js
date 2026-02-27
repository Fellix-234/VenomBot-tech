import { sendText, sendImage } from '../modules/connection.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

export default {
  name: 'developers',
  aliases: ['devs', 'founder', 'credits'],
  category: 'general',
  description: 'Show bot developers info',
  usage: '!developers',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    let text = "*👨‍💻 VENOMBOT DEVELOPERS*\n\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
    text += "*Founders:*\n\n";
    text += "1. *Wondering Jew*\n";
    text += "   📱 +254725391914\n";
    text += "   💻 Lead Developer\n\n";
    text += "2. *Warrior Felix*\n";
    text += "   📱 +254701881604\n";
    text += "   💻 Co-Developer\n\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
    text += "*Thanks to all contributors!*\n\n";
    text += "Made with ❤️ by VenomBot Tech";
    
    // Try to send images with developer info
    try {
      const files = fs.readdirSync(assetsPath).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
      
      if (files.length > 0) {
        // Send first image as header
        const imagePath = path.join(assetsPath, files[0]);
        await sendImage(fromJid, { url: imagePath }, text, msg);
      } else {
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      await sendText(fromJid, text, msg);
    }
  }
};
