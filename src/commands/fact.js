import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'fact',
  aliases: ['facts', 'didyouknow'],
  category: 'fun',
  description: 'Get a random interesting fact',
  usage: '!fact',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random', {
        headers: { 'User-Agent': 'VenomBot/2.0' }
      });
      
      const fact = response.data.text;
      
      let text = `╭─「 *DID YOU KNOW?* 」\n`;
      text += `│ ${fact}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      // Fallback facts
      const fallbackFacts = [
        "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
        "Octopuses have three hearts and blue blood.",
        "A day on Venus is longer than a year on Venus.",
        "Bananas are berries, but strawberries aren't.",
        "The human brain uses about 20% of the body's total energy."
      ];
      
      const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      
      let text = `╭─「 *DID YOU KNOW?* 」\n`;
      text += `│ ${randomFact}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    }
  }
};
