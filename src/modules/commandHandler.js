import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { sendText } from './connection.js';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, '../commands');

// Store loaded commands
const commands = new Map();

/**
 * Load all command files
 */
export const loadCommands = async () => {
  try {
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    if (files.length === 0) {
      logger.warn('⚠️  No command files found in commands folder');
      return;
    }
    
    let loadedCount = 0;
    for (const file of files) {
      try {
        const command = await import(`../commands/${file}`);
        const commandName = file.replace('.js', '');
        
        if (command.default && command.default.name) {
          commands.set(command.default.name, command.default);
          
          // Register aliases
          if (command.default.aliases) {
            for (const alias of command.default.aliases) {
              commands.set(alias, command.default);
            }
          }
          
          logger.success(`✓ Loaded command: ${command.default.name}`);
          loadedCount++;
        }
      } catch (error) {
        logger.error(`Failed to load command ${file}:`, error.message);
      }
    }
    
    logger.info(`📦 Loaded ${loadedCount} commands out of ${files.length} files`);
  } catch (error) {
    logger.error('Error loading commands:', error.message);
    logger.warn('⚠️  Bot will run with no commands loaded');
  }
};

/**
 * Handle command execution
 */
export const commandHandler = async (context) => {
  const { command, fromJid, msg, isOwner } = context;
  
  const cmd = commands.get(command);
  
  if (!cmd) {
    // Command not found
    return;
  }
  
  // Check if command requires owner permission
  if (cmd.ownerOnly && !isOwner) {
    await sendText(fromJid, '❌ This command is only for bot owner!', msg);
    return;
  }
  
  // Check if command is group only
  if (cmd.groupOnly && !context.isGroup) {
    await sendText(fromJid, '❌ This command can only be used in groups!', msg);
    return;
  }
  
  // Check if command is private only
  if (cmd.privateOnly && context.isGroup) {
    await sendText(fromJid, '❌ This command can only be used in private chat!', msg);
    return;
  }
  
  try {
    await cmd.execute(context);
  } catch (error) {
    logger.error(`Error executing command ${command}:`, error);
    await sendText(fromJid, `❌ Error executing command: ${error.message}`, msg);
  }
};

/**
 * Get all commands
 */
export const getCommands = () => {
  return Array.from(commands.values()).filter((cmd, index, self) => 
    index === self.findIndex(c => c.name === cmd.name)
  );
};

/**
 * Get command by name
 */
export const getCommand = (name) => {
  return commands.get(name);
};
