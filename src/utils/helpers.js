import { config } from '../config.js';

/**
 * Format phone number to JID format
 */
export const formatJid = (number) => {
  if (!number) return '';
  const cleaned = number.replace(/[^0-9]/g, '');
  return cleaned.includes('@') ? cleaned : `${cleaned}@s.whatsapp.net`;
};

/**
 * Check if user is owner/admin
 */
export const isOwner = (jid) => {
  const number = jid.split('@')[0];
  return config.admins.includes(number) || number === config.bot.owner;
};

/**
 * Check if message is from a group
 */
export const isGroup = (jid) => {
  return jid.endsWith('@g.us');
};

/**
 * Extract numbers from text
 */
export const extractNumbers = (text) => {
  return text.match(/\d+/g) || [];
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Format uptime to readable string
 */
export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
};

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Parse command from message
 */
export const parseCommand = (text) => {
  if (!text.startsWith(config.bot.prefix)) return null;
  
  const args = text.slice(config.bot.prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
  
  return { command, args };
};

/**
 * Clean phone number
 */
export const cleanNumber = (number) => {
  return number.replace(/[^0-9]/g, '');
};

/**
 * Get time greeting
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Get random element from array
 */
export const randomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Check if URL is valid
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Extract URLs from text
 */
export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Sanitize text for markdown
 */
export const sanitizeMarkdown = (text) => {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`');
};
