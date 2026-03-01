import os from 'os';
import { sendText } from '../modules/connection.js';
import { config } from '../config.js';
import { getCommands } from '../modules/commandHandler.js';
import { formatBytes, formatUptime } from '../utils/helpers.js';

export default {
  name: 'dashboard',
  aliases: ['panel', 'stats', 'healthcheck'],
  category: 'general',
  description: 'Professional live dashboard for bot runtime and system status',
  usage: '!dashboard',
  ownerOnly: false,
  groupOnly: false,

  execute: async ({ fromJid, msg }) => {
    const memory = process.memoryUsage();
    const commands = getCommands();
    const uptime = formatUptime(process.uptime());
    const now = new Date();

    let text = '';
    text += `╔════════════════════════════════════════════╗\n`;
    text += `║          📊 LIVE BOT DASHBOARD            ║\n`;
    text += `╚════════════════════════════════════════════╝\n\n`;

    text += `🤖 *Bot:* ${config.bot.name} v${config.bot.version}\n`;
    text += `⚙️ *Prefix:* ${config.bot.prefix}\n`;
    text += `📦 *Commands Loaded:* ${commands.length}\n`;
    text += `⏱️ *Uptime:* ${uptime}\n`;
    text += `🕒 *Server Time:* ${now.toLocaleString()}\n\n`;

    text += `┌─ 🖥️ SYSTEM ────────────────────────────────\n`;
    text += `│ Platform: ${os.platform()} ${os.arch()}\n`;
    text += `│ Node: ${process.version}\n`;
    text += `│ CPU: ${os.cpus().length} cores\n`;
    text += `│ Host: ${os.hostname()}\n`;
    text += `└────────────────────────────────────────────\n\n`;

    text += `┌─ 🧠 MEMORY ────────────────────────────────\n`;
    text += `│ Heap Used: ${formatBytes(memory.heapUsed)}\n`;
    text += `│ Heap Total: ${formatBytes(memory.heapTotal)}\n`;
    text += `│ RSS: ${formatBytes(memory.rss)}\n`;
    text += `│ External: ${formatBytes(memory.external)}\n`;
    text += `└────────────────────────────────────────────\n\n`;

    text += `✅ *Status:* Online and operational\n`;
    text += `💡 Use *${config.bot.prefix}help* for full command menu`;

    await sendText(fromJid, text, msg);
  },
};
