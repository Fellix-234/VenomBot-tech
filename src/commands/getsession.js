import { sendText } from '../modules/connection.js';
import { getSocket, getBotId } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'getsession',
  aliases: ['session', 'getsess', 'sid'],
  category: 'utility',
  description: 'Get your WhatsApp session information',
  usage: '!getsession',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const sock = getSocket();
    const botId = getBotId();
    
    // Get base URL from environment or construct it
    const baseUrl = process.env.RENDER_EXTERNAL_URL || 
                    process.env.PUBLIC_URL || 
                    process.env.VERCEL_URL ||
                    'http://localhost:' + (process.env.PORT || 3000);
    
    let text = "*📱 SESSION INFO*\n\n";
    
    if (sock && sock.user) {
      // Bot is connected
      const userId = sock.user.id || '';
      const userName = sock.user.name || 'N/A';
      const phoneNumber = userId.split(':')[0] || userId.split('@')[0] || 'N/A';
      
      text += "✅ *Status:* Connected to WhatsApp\n\n";
      text += "*Your Session Details:*\n";
      text += "• Phone: `" + phoneNumber + "`\n";
      text += "• Name: " + userName + "\n";
      text += "• Full ID: `" + userId + "`\n\n";
      
      text += "*🔐 Session ID:*\n";
      text += "`" + botId + "`\n\n";
      
      text += "*🌐 Web Panel:*\n";
      text += baseUrl + "/session\n\n";
      
      text += "*Note:* Your session is saved locally. ";
      text += "To get a new session, delete the auth_info_baileys folder and restart.";
    } else {
      // Bot is not connected
      text += "⚠️ *Status:* Not connected to WhatsApp\n\n";
      
      text += "*To connect your bot:*\n\n";
      text += "1. Visit: " + baseUrl + "/session\n";
      text += "2. Scan the QR code with WhatsApp\n";
      text += "   - Open WhatsApp → Settings → Linked Devices\n";
      text += "   - Tap 'Link a Device'\n";
      text += "   - Scan the QR code on the page\n\n";
      
      text += "*Alternative - Pairing Code:*\n";
      text += "1. Go to: " + baseUrl + "/session\n";
      text += "2. Enter your phone number with country code\n";
      text += "3. Click 'Generate Pairing Code'\n";
      text += "4. Enter the code in WhatsApp → Linked Devices\n\n";
      
      text += "*Session Location:*\n";
      text += "• auth_info_baileys/\n\n";
      
      text += "*Tip:* Keep your session files secure and never share them.";
    }
    
    await sendText(fromJid, text, msg);
  }
};
