import NodeCache from 'node-cache';
import { config } from '../config.js';

// Cache for rate limiting (TTL = timeWindow in seconds)
const rateLimitCache = new NodeCache({ 
  stdTTL: config.rateLimit.timeWindow / 1000,
  checkperiod: 10 
});

// General purpose cache
const generalCache = new NodeCache({ 
  stdTTL: 600, // 10 minutes default
  checkperiod: 120 
});

/**
 * Check if user is rate limited
 */
export const isRateLimited = (userId) => {
  const key = `ratelimit_${userId}`;
  const count = rateLimitCache.get(key) || 0;
  
  if (count >= config.rateLimit.maxCommands) {
    return true;
  }
  
  rateLimitCache.set(key, count + 1);
  return false;
};

/**
 * Get remaining rate limit time
 */
export const getRateLimitRemaining = (userId) => {
  const key = `ratelimit_${userId}`;
  return rateLimitCache.getTtl(key);
};

/**
 * Cache functions
 */
export const cache = {
  set: (key, value, ttl) => generalCache.set(key, value, ttl),
  get: (key) => generalCache.get(key),
  del: (key) => generalCache.del(key),
  has: (key) => generalCache.has(key),
  flush: () => generalCache.flushAll(),
  keys: () => generalCache.keys(),
};

/**
 * User session management
 */
const userSessions = new Map();

export const userSession = {
  set: (userId, data) => {
    userSessions.set(userId, { ...data, lastActivity: Date.now() });
  },
  
  get: (userId) => {
    return userSessions.get(userId);
  },
  
  update: (userId, data) => {
    const existing = userSessions.get(userId) || {};
    userSessions.set(userId, { ...existing, ...data, lastActivity: Date.now() });
  },
  
  delete: (userId) => {
    userSessions.delete(userId);
  },
  
  has: (userId) => {
    return userSessions.has(userId);
  },
  
  clear: () => {
    userSessions.clear();
  },
};

// Deleted messages cache for antidelete feature
const deletedMessagesCache = new Map();

export const deletedMessages = {
  set: (key, message) => {
    // Keep only last 100 deleted messages per chat
    if (deletedMessagesCache.size >= 100) {
      const firstKey = deletedMessagesCache.keys().next().value;
      deletedMessagesCache.delete(firstKey);
    }
    deletedMessagesCache.set(key, message);
  },
  
  get: (key) => {
    return deletedMessagesCache.get(key);
  },
  
  delete: (key) => {
    deletedMessagesCache.delete(key);
  },
  
  getAll: () => {
    return Array.from(deletedMessagesCache.entries());
  },
  
  clear: () => {
    deletedMessagesCache.clear();
  },
};
