import { sendText, sendImage } from '../modules/connection.js';
import { config } from '../config.js';
import { getCommands } from '../modules/commandHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.join(__dirname, '../../assets');

const categories = {
  general: { icon: '🏠', title: 'General' },
  admin: { icon: '⚙️', title: 'Admin' },
  group: { icon: '👥', title: 'Group' },
  media: { icon: '📺', title: 'Media' },
  entertainment: { icon: '🎭', title: 'Entertainment' },
  ai: { icon: '🤖', title: 'AI' },
  fun: { icon: '🎮', title: 'Fun' },
  tools: { icon: '🔧', title: 'Tools' },
  utility: { icon: '📝', title: 'Utility' },
  owner: { icon: '👑', title: 'Owner' },
};

export default {
  name: 'help',
  aliases: ['h', 'menu', 'commands', 'cmd', 'list'],
  category: 'general',
  description: 'Professional command menu',
  usage: '!help [command]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args, isOwner }) => {
    const commands = getCommands();
    const prefix = config.bot.prefix;
    const cmdCount = commands.length;
    
    if (args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const command = commands.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
      
      if (command) {
        const cat = categories[command.category] || { icon: '📌', title: command.category };
        
        let text = `${'━'.repeat(42)}\n`;
        text += `  ${cat.icon} ${command.name.toUpperCase()} COMMAND\n`;
        text += `${'━'.repeat(42)}\n\n`;
        text += `📖 ${command.description}\n\n`;
        text += `🔧 ${command.usage}\n\n`;
        text += `📂 ${cat.icon} ${cat.title}\n`;
        
        if (command.aliases?.length > 0) {
          text += `🔗 ${command.aliases.map(a => prefix + a).join(', ')}\n`;
        }
        
        text += `\n${'━'.repeat(42)}\n`;
        text += `💡 ${prefix}help - Main menu`;
        
        await sendText(fromJid, text, msg);
      } else {
        await sendText(fromJid, `❌ Command "${cmdName}" not found!\n💡 ${prefix}help`, msg);
      }
      return;
    }
    
    const cmdByCat = {};
    commands.forEach(cmd => {
      if (!cmdByCat[cmd.category]) cmdByCat[cmd.category] = [];
      cmdByCat[cmd.category].push(cmd);
    });
    
    let text = '';
    
    text += `${'═'.repeat(44)}\n`;
    text += `  🤖 ${config.bot.name} v${config.bot.version}\n`;
    text += `  Premium WhatsApp Bot\n`;
    text += `${'═'.repeat(44)}\n\n`;
    
    text += `┌────────────────────────────────────────────┐\n`;
    text += `│ 💬 ${cmdCount} Commands  │ ⏰ 24/7 │ v${config.bot.version} │\n`;
    text += `└────────────────────────────────────────────┘\n\n`;
    
    const catOrder = ['general', 'admin', 'group', 'media', 'entertainment', 'ai', 'fun', 'tools', 'utility', 'owner'];
    const sortedCats = Object.keys(cmdByCat).sort((a, b) => 
      (catOrder.indexOf(a) === -1 ? 99 : catOrder.indexOf(a)) - 
      (catOrder.indexOf(b) === -1 ? 99 : catOrder.indexOf(b))
    );
    
    for (const cat of sortedCats) {
      const cmds = cmdByCat[cat];
      const c = categories[cat] || { icon: '📌', title: cat };
      
      text += `┌─ ${c.icon} ${c.title} ──────────────────────────\n`;
      text += `├────────────────────────────────────────────\n`;
      
      for (let i = 0; i < cmds.length; i += 2) {
        const cmd1 = cmds[i];
        const cmd2 = cmds[i + 1];
        
        if (cmd2) {
          text += `│ ${prefix}${cmd1.name.padEnd(12)}  ${prefix}${cmd2.name}\n`;
        } else {
          text += `│ ${prefix}${cmd1.name}\n`;
        }
      }
      
      text += `└${'─'.repeat(41)}\n\n`;
    }
    
    text += `┌─ 🎯 QUICK ACCESS ──────────────────────────\n`;
    text += `│ ${prefix}help <cmd>  │ ${prefix}play    │ ${prefix}song\n`;
    text += `│ ${prefix}tiktok     │ ${prefix}twitter  │ ${prefix}tr\n`;
    text += `│ ${prefix}sticker   │ ${prefix}ai       │ ${prefix}ping\n`;
    text += `└${'─'.repeat(41)}\n\n`;
    
    text += `${'─'.repeat(44)}\n`;
    text += `│ 💻 VenomBot Tech Team\n`;
    text += `│ 📢 Join Channel: ${config.bot.channel}\n`;
    text += `${'─'.repeat(44)}\n`;
    text += `\n💡 ${prefix}help <command>`;
    
    try {
      const menuImg = path.join(assetsPath, 'WhatsApp Image 2026-02-27 at 15.42.21.jpeg');
      if (fs.existsSync(menuImg)) {
        await sendImage(fromJid, fs.readFileSync(menuImg), text, msg);
      } else {
        await sendText(fromJid, text, msg);
      }
    } catch {
      await sendText(fromJid, text, msg);
    }
  }
};
