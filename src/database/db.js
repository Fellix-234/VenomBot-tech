import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonDbPath = path.join(__dirname, '../../data.json');

// Simple JSON Database
class JsonDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(jsonDbPath)) {
        return JSON.parse(fs.readFileSync(jsonDbPath, 'utf-8'));
      }
    } catch (error) {
      logger.warn('Error loading JSON database:', error);
    }
    return {
      users: [],
      groups: [],
      messages: [],
      settings: {},
    };
  }

  save() {
    try {
      fs.writeFileSync(jsonDbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      logger.error('Error saving JSON database:', error);
    }
  }

  // User operations
  addUser(userId, userData) {
    const existing = this.data.users.find(u => u.id === userId);
    if (existing) {
      Object.assign(existing, userData);
    } else {
      this.data.users.push({ id: userId, ...userData, createdAt: new Date() });
    }
    this.save();
  }

  getUser(userId) {
    return this.data.users.find(u => u.id === userId);
  }

  getAllUsers() {
    return this.data.users;
  }

  // Message operations
  logMessage(fromJid, toJid, messageText, messageType = 'text') {
    this.data.messages.push({
      from: fromJid,
      to: toJid,
      text: messageText,
      type: messageType,
      timestamp: new Date(),
    });
    this.save();
  }

  // Settings operations
  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  getSetting(key, defaultValue = null) {
    return this.data.settings[key] ?? defaultValue;
  }
}

// Initialize database
export let db;

export const initializeDatabase = async () => {
  try {
    if (config.database.useJsonDb) {
      db = new JsonDatabase();
      logger.info('✅ JSON Database initialized');
    } else {
      await mongoose.connect(config.database.url);
      logger.info('✅ MongoDB connected');
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    // Fallback to JSON database
    db = new JsonDatabase();
    logger.info('✅ Fallback to JSON Database');
  }
};

export const closeDatabase = async () => {
  if (!config.database.useJsonDb) {
    await mongoose.disconnect();
    logger.info('Database disconnected');
  }
};
