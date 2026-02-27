import { sendImage, sendText } from '../modules/connection.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

export default {
  name: 'gallery',
  aliases: ['images', 'assets'],
  category: 'media',
  description: 'View bot gallery images',
  usage: '!gallery',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    try {
      const files = fs.readdirSync(assetsPath).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
      
      if (files.length === 0) {
        await sendText(fromJid, 'No images found in gallery!', msg);
        return;
      }
      
      // Get specific image or random
      let imageIndex = parseInt(args[0]) - 1;
      
      if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= files.length) {
        // Send random image
        const randomImage = files[Math.floor(Math.random() * files.length)];
        const imagePath = path.join(assetsPath, randomImage);
        await sendImage(fromJid, { url: imagePath }, 'Gallery Image: ' + randomImage, msg);
      } else {
        // Send specific image
        const imagePath = path.join(assetsPath, files[imageIndex]);
        await sendImage(fromJid, { url: imagePath }, 'Gallery Image: ' + files[imageIndex], msg);
      }
    } catch (error) {
      await sendText(fromJid, 'Error loading gallery!', msg);
    }
  }
};
