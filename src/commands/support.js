import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'support',
  aliases: ['helpdesk', 'contact', 'assist'],
  category: 'general',
  description: 'Professional support center with official contact and project links',
  usage: '!support',
  ownerOnly: false,
  groupOnly: false,

  execute: async ({ fromJid, msg }) => {
    let text = '';
    text += `╔════════════════════════════════════════════╗\n`;
    text += `║            🛟 SUPPORT CENTER               ║\n`;
    text += `╚════════════════════════════════════════════╝\n\n`;

    text += `📢 *Official Channel*\n`;
    text += `${config.bot.channel}\n\n`;

    text += `🧩 *Project Links*\n`;
    text += `• Repository: https://github.com/Fellix-234/VenomBot-Tech\n`;
    text += `• Issues: https://github.com/Fellix-234/VenomBot-Tech/issues\n`;
    text += `• Deployment Guide: https://github.com/Fellix-234/VenomBot-Tech/blob/main/DEPLOYMENT.md\n\n`;

    text += `📋 *Quick Support Flow*\n`;
    text += `1. Run *${config.bot.prefix}dashboard* and copy the output\n`;
    text += `2. Describe your issue clearly\n`;
    text += `3. Include command used + error message\n`;
    text += `4. Share logs/screenshots if possible\n\n`;

    text += `✅ Faster reports = Faster fixes`;

    await sendText(fromJid, text, msg);
  },
};
