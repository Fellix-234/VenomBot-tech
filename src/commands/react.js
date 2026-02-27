import { sendText, react } from '../modules/connection.js';

export default {
  name: 'react',
  aliases: ['reaction'],
  category: 'fun',
  description: 'React to the last message with an emoji',
  usage: '!react <emoji>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    // Get emoji from args or use random
    let emoji = args[0];
    
    const randomReactions = ['❤️', '👍', '😂', '🔥', '😊', '🎉', '❤️‍🔥', '👀', '🤔', '💯', '✨', '🙌'];
    
    if (!emoji) {
      emoji = randomReactions[Math.floor(Math.random() * randomReactions.length)];
    }
    
    try {
      await react(fromJid, msg.key, emoji);
    } catch (error) {
      await sendText(fromJid, `❌ Failed to react with ${emoji}`, msg);
    }
  }
};
