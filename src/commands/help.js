import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';
import { getCommands } from '../modules/commandHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

export default {
  name: 'help',
  aliases: ['h', 'menu', 'commands'],
  category: 'general',
  description: 'Display all available commands',
  usage: '!help [command]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (args.length > 0) {
      // Show help for specific command
      const cmdName = args[0].toLowerCase();
      const commands = getCommands();
      const command = commands.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
      
      if (command) {
        let text = `╭─「 *${command.name.toUpperCase()}* 」\n`;
        text += `│ • *Description:* ${command.description}\n`;
        text += `│ • *Usage:* ${command.usage}\n`;
        text += `│ • *Category:* ${command.category}\n`;
        if (command.aliases?.length > 0) {
          text += `│ • *Aliases:* ${command.aliases.join(', ')}\n`;
        }
        text += `╰────────────⦁`;
        
        await sendText(fromJid, text, msg);
      } else {
        await sendText(fromJid, `❌ Command "${cmdName}" not found!`, msg);
      }
      return;
    }
    
    // Show all commands grouped by category
    const commands = getCommands();
    const categories = {};
    
    commands.forEach(cmd => {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd);
    });
    
    let text = `╭─「 *${config.bot.name} MENU* 」\n`;
    text += `│ • *Prefix:* ${config.bot.prefix}\n`;
    text += `│ • *Version:* ${config.bot.version}\n`;
    text += `│ • *Commands:* ${commands.length}\n`;
    text += `╰────────────⦁\n\n`;
    
    for (const [category, cmds] of Object.entries(categories)) {
      text += `┌─⟦ *${category.toUpperCase()}* ⟧\n`;
      cmds.forEach(cmd => {
        text += `│ • ${config.bot.prefix}${cmd.name} - ${cmd.description}\n`;
      });
      text += `└────────────⦁\n\n`;
    }
    
    text += `_Type ${config.bot.prefix}help <command> for more details_`;
    
    // Try to send with menu image
    try {
      const menuImage = path.join(assetsPath, 'WhatsApp Image 2026-02-27 at 15.42.21.jpeg');
      if (fs.existsSync(menuImage)) {
        const imageBuffer = fs.readFileSync(menuImage);
        await sendImage(fromJid, imageBuffer, text, msg);
      } else {
        await sendText(fromJid, text, msg);
      }
    } catch (error) {
      await sendText(fromJid, text, msg);
    }
  }
};
