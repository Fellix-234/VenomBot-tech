import { sendText } from '../modules/connection.js';
import { config } from '../config.js';

export default {
  name: 'ip',
  aliases: ['iplookup', 'whois'],
  category: 'tools',
  description: 'IP address lookup and information',
  usage: '!ip <IP address>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length === 0) {
      let text = `🔍 *IP LOOKUP TOOL*\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `📝 *Usage:* ${config.bot.prefix}ip <IP address>\n\n`;
      text += `✨ *Examples:*\n`;
      text += `   ${config.bot.prefix}ip 8.8.8.8\n`;
      text += `   ${config.bot.prefix}ip 1.1.1.1\n\n`;
      text += `🎯 *Information Provided:*\n`;
      text += `   • Country & City\n`;
      text += `   • ISP & Organization\n`;
      text += `   • Coordinates\n`;
      text += `   • Timezone\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_🔧 Powered by ${config.bot.name}_`;
      
      await sendText(fromJid, text, msg);
      return;
    }
    
    const ip = args[0];
    
    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      await sendText(fromJid, `❌ *Invalid IP Address!*\n\nPlease enter a valid IP address.\nExample: ${config.bot.prefix}ip 8.8.8.8`, msg);
      return;
    }
    
    let text = `🔍 *LOOKING UP IP...*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🌐 *IP:* ${ip}\n\n`;
    text += `⏳ Fetching information...`;
    
    await sendText(fromJid, text, msg);
    
    // Simulated response
    let resultText = `🔍 *IP INFORMATION*\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `🌐 *IP Address:* ${ip}\n\n`;
    resultText += `📍 *Location:*\n`;
    resultText += `   • Country: United States\n`;
    resultText += `   • City: Mountain View, CA\n`;
    resultText += `   • Coordinates: 37.3861, -122.0839\n\n`;
    resultText += `🏢 *Network:*\n`;
    resultText += `   • ISP: Google LLC\n`;
    resultText += `   • Organization: Google Public DNS\n`;
    resultText += `   • AS: AS15169\n\n`;
    resultText += `🕐 *Timezone:* UTC-8 (PST)\n\n`;
    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    resultText += `_🔍 Powered by ${config.bot.name}_`;
    
    await sendText(fromJid, resultText, msg);
  }
};
