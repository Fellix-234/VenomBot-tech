import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'autoread',
  aliases: ['autoread'],
  category: 'settings',
  description: 'Toggle auto read messages',
  usage: '!autoread',
  ownerOnly: true,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    config.settings.autoRead = !config.settings.autoRead;
    
    let text = `╭─「 *AUTOREAD* 」\n`;
    text += `│ ${config.settings.autoRead ? '✅ Enabled' : '❌ Disabled'}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
