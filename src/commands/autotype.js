import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'autotype',
  aliases: ['typing'],
  category: 'settings',
  description: 'Toggle auto typing indicator',
  usage: '!autotype',
  ownerOnly: true,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    config.settings.autoTyping = !config.settings.autoTyping;
    
    let text = `╭─「 *AUTOTYPE* 」\n`;
    text += `│ ${config.settings.autoTyping ? '✅ Enabled' : '❌ Disabled'}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
