import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

export const config = {
  // Bot Information
  bot: {
    name: process.env.BOT_NAME || 'VenomBot',
    prefix: process.env.PREFIX || '!',
    owner: process.env.OWNER_NUMBER || '',
    timezone: process.env.TIMEZONE || 'Asia/Kolkata',
    version: '2.0.0',
  },

  // Database Configuration
  database: {
    useJsonDb: process.env.USE_JSON_DB === 'true',
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/venombot',
  },

  // Bot Settings
  settings: {
    autoRead: process.env.AUTO_READ === 'true',
    autoTyping: process.env.AUTO_TYPING === 'true',
    autoRecording: process.env.AUTO_RECORDING === 'true',
    autoReact: process.env.AUTO_REACT === 'true',
    antiLink: process.env.ANTI_LINK === 'true',
    antiBot: process.env.ANTI_BOT === 'true',
  },

  // API Keys
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    weather: process.env.WEATHER_API_KEY || '',
  },

  // Paths
  paths: {
    session: path.join(__dirname, '../auth_info_baileys'),
    logs: path.join(__dirname, '../logs'),
    assets: path.join(__dirname, '../assets'),
  },

  // Rate Limiting
  rateLimit: {
    maxCommands: 10, // Max commands per user
    timeWindow: 60000, // Time window in ms (1 minute)
  },

  // Admin/Owner permissions
  admins: process.env.OWNER_NUMBER ? [process.env.OWNER_NUMBER] : [],
};
