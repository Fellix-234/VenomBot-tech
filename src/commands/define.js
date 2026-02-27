import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'define',
  aliases: ['dictionary', 'meaning'],
  category: 'utility',
  description: 'Get the definition of a word',
  usage: '!define <word>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a word to define!\nUsage: !define <word>', msg);
      return;
    }

    const word = args.join(' ');
    
    try {
      // Using Free Dictionary API
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      
      const data = response.data;
      
      if (!data || data.length === 0) {
        await sendText(fromJid, `❌ No definition found for "${word}"`, msg);
        return;
      }
      
      const entry = data[0];
      const definition = entry.meanings[0]?.definitions[0];
      
      if (!definition) {
        await sendText(fromJid, `❌ No definition found for "${word}"`, msg);
        return;
      }
      
      let text = `╭─「 *${entry.word.toUpperCase()}* 」\n`;
      text += `│ 📖 *${entry.meanings[0].partOfSpeech}*\n\n`;
      text += `│ ${definition.definition}\n`;
      
      if (definition.example) {
        text += `\n│ 📝 *Example:*\n│ "${definition.example}"\n`;
      }
      
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        await sendText(fromJid, `❌ Word "${word}" not found in dictionary.`, msg);
      } else {
        await sendText(fromJid, '❌ Unable to get definition. Please try again later.', msg);
      }
    }
  }
};
