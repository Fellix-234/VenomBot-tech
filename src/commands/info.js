import { sendText, getSocket } from '../modules/connection.js';
import { config } from '../config.js';
import { formatUptime, formatBytes } from '../utils/helpers.js';
import os from 'os';

export default {
  name: 'info',
  aliases: ['botinfo', 'status'],
  category: 'general',
  description: 'Display bot information and statistics',
  usage: '!info',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const sock = getSocket();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    let text = `╭─「 *BOT INFORMATION* 」\n`;
    text += `│\n`;
    text += `│ • *Name:* ${config.bot.name}\n`;
    text += `│ • *Version:* ${config.bot.version}\n`;
    text += `│ • *Prefix:* ${config.bot.prefix}\n`;
    text += `│ • *Bot Number:* ${sock.user?.id.split(':')[0] || 'Unknown'}\n`;
    text += `│\n`;
    text += `├─「 *SYSTEM INFO* 」\n`;
    text += `│\n`;
    text += `│ • *Uptime:* ${formatUptime(uptime)}\n`;
    text += `│ • *Platform:* ${os.platform()}\n`;
    text += `│ • *Node Version:* ${process.version}\n`;
    text += `│ • *CPU:* ${os.cpus()[0].model}\n`;
    text += `│ • *CPU Cores:* ${os.cpus().length}\n`;
    text += `│ • *RAM Usage:* ${formatBytes(memoryUsage.heapUsed)} / ${formatBytes(os.totalmem())}\n`;
    text += `│\n`;
    text += `╰────────────⦁`;
    
    await sendText(fromJid, text, msg);
  }
};
