import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'autoreact',
  aliases: ['reactions'],
  category: 'settings',
  description: 'Toggle auto reaction to messages',
  usage: '!autoreact',
  ownerOnly: true,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    // Toggle autoreact setting
    if (!config.settings.autoReact) {
      config.settings.autoReact = true;
    } else {
      config.settings.autoReact = !config.settings.autoReact;
    }
    
    let text = `╭─「 *AUTOREACT* 」\n`;
    text += `│ ${config.settings.autoReact ? '✅ Enabled' : '❌ Disabled'}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
