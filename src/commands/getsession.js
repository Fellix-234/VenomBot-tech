import { sendText } from '../modules/connection.js';

export default {
  name: 'getsession',
  aliases: ['session', 'getsess'],
  category: 'utility',
  description: 'Get session info',
  usage: '!getsession',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    let text = "*📱 SESSION INFO*\n\n";
    text += "Your WhatsApp session is automatically saved!\n\n";
    text += "*How to get new session:*\n";
    text += "1. Delete the 'auth_info_baileys' folder\n";
    text += "2. Restart the bot\n";
    text += "3. Scan the QR code again\n\n";
    text += "*Session Location:*\n";
    text += "• auth_info_baileys/\n\n";
    text += "*Note:* Session data is stored locally for multi-device support.";
    
    await sendText(fromJid, text, msg);
  }
};
