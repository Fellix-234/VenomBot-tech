import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'autorecording',
  aliases: ['recording'],
  category: 'settings',
  description: 'Toggle auto recording indicator',
  usage: '!autorecording',
  ownerOnly: true,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    config.settings.autoRecording = !config.settings.autoRecording;
    
    let text = `╭─「 *AUTORECORDING* 」\n`;
    text += `│ ${config.settings.autoRecording ? '✅ Enabled' : '❌ Disabled'}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
