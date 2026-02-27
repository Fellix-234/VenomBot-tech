import { sendText } from '../modules/connection.js';

export default {
  name: 'password',
  aliases: ['pass', 'genpass', 'pwd'],
  category: 'utility',
  description: 'Generate a secure random password',
  usage: '!password [length] (default: 16)',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    try {
      const length = parseInt(args[0]) || 16;
      
      if (length < 8 || length > 50) {
        await sendText(fromJid, '❌ Password length must be between 8 and 50 characters', msg);
        return;
      }
      
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let password = '';
      
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      
      let text = `🔐 *Generated Password*\n\n`;
      text += `\`\`\`${password}\`\`\`\n\n`;
      text += `Length: ${length} characters\n`;
      text += `Strength: ${length >= 16 ? 'Very Strong 💪' : length >= 12 ? 'Strong ✅' : 'Medium ⚠️'}`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to generate password', msg);
    }
  }
};
