import { sendText } from '../modules/connection.js';
import QRCode from 'qrcode';

export default {
  name: 'qrgen',
  aliases: ['qrcode', 'makeqr'],
  category: 'utility',
  description: 'Generate QR code from text',
  usage: '!qrgen [text]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    try {
      if (!args.length) {
        await sendText(fromJid, '❌ Please provide text to generate QR code\n\nUsage: !qrgen Hello World', msg);
        return;
      }
      
      const text = args.join(' ');
      const qrUrl = await QRCode.toDataURL(text, { width: 400 });
      
      await sendText(fromJid, `🔲 *QR Code Generated*\n\nScan this QR code:\n${qrUrl}`, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to generate QR code', msg);
    }
  }
};
