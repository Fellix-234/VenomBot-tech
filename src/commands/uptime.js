import axios from 'axios';
import { config } from '../config.js';
import { sendText } from '../modules/connection.js';

// Store bot start time
export const startTime = Date.now();

export default {
  name: 'uptime',
  aliases: ['up', 'botinfo'],
  category: 'utility',
  description: 'Check bot uptime and information',
  usage: '!uptime',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const currentTime = Date.now();
    const uptimeMs = currentTime - startTime;
    
    // Convert to readable format
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const readableUptime = `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    
    let text = `╭─「 *BOT INFO* 」\n`;
    text += `│ • *Name:* ${config.bot.name}\n`;
    text += `│ • *Version:* ${config.bot.version}\n`;
    text += `│ • *Uptime:* ${readableUptime}\n`;
    text += `│ • *Prefix:* ${config.bot.prefix}\n`;
    text += `│ • *Mode:* ${config.settings.autoTyping ? 'Active' : 'Inactive'}\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
