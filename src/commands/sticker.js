import { sendText, sendSticker } from '../modules/connection.js';
import { getSocket } from '../modules/connection.js';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: 'sticker',
  aliases: ['s', 'stiker', 'to sticker'],
  category: 'media',
  description: 'Convert image to sticker or create sticker from URL',
  usage: '!sticker (reply to image) or !sticker <image_url>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg, sock }) => {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let imageBuffer = null;
      let mediaType = null;

      // Check if user replied to an image
      if (quoted?.imageMessage) {
        const media = await downloadMedia(quoted.imageMessage, sock);
        if (media) {
          imageBuffer = media;
          mediaType = 'image';
        }
      } 
      // Check if user provided URL as argument
      else if (args.length > 0) {
        const url = args[0];
        if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i)) {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data);
          mediaType = 'image';
        } else {
          await sendText(fromJid, '❌ Invalid image URL!', msg);
          return;
        }
      }
      // Check for image in message
      else if (msg.message?.imageMessage) {
        const media = await downloadMedia(msg.message.imageMessage, sock);
        if (media) {
          imageBuffer = media;
          mediaType = 'image';
        }
      }

      if (!imageBuffer) {
        await sendText(fromJid, '❌ Please reply to an image or provide an image URL!\nUsage: !sticker <image_url>\nOr reply to an image with !sticker', msg);
        return;
      }

      await sendText(fromJid, '⏳ Creating sticker...', msg);

      // Convert to sticker using sharp
      const stickerBuffer = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toBuffer();

      await sendSticker(fromJid, stickerBuffer, msg);
      
    } catch (error) {
      console.error('Sticker error:', error);
      await sendText(fromJid, '❌ Failed to create sticker. Please try again!', msg);
    }
  }
};

// Helper function to download media
async function downloadMedia(message, sock) {
  try {
    const stream = await sock.downloadMediaMessage(message);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Download media error:', error);
    return null;
  }
}
