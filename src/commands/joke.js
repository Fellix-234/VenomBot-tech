import axios from 'axios';
import { sendText } from '../modules/connection.js';

export default {
  name: 'joke',
  aliases: ['jokes'],
  category: 'fun',
  description: 'Get a random joke',
  usage: '!joke',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
      
      const data = response.data;
      
      let text = `╭─「 *JOKE* 」\n`;
      text += `│ ${data.joke}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      // Fallback jokes
      const fallbackJokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "What do you call a fake noodle? An impasta!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call a bear with no teeth? A gummy bear!",
        "Why don't eggs tell jokes? They'd crack each other up!"
      ];
      
      const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      
      let text = `╭─「 *JOKE* 」\n`;
      text += `│ ${randomJoke}\n`;
      text += `╰────────────⦁`;
      
      await sendText(fromJid, text, msg);
    }
  }
};
