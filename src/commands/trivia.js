import { sendText } from '../modules/connection.js';
import axios from 'axios';

export default {
  name: 'trivia',
  aliases: ['quiz', 'question'],
  category: 'fun',
  description: 'Get a random trivia question',
  usage: '!trivia',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const question = response.data.results[0];
      
      const allAnswers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
      
      let text = `🧠 *Trivia Question*\n\n`;
      text += `*Category:* ${question.category}\n`;
      text += `*Difficulty:* ${question.difficulty}\n\n`;
      text += `*Question:* ${question.question}\n\n`;
      text += `*Options:*\n`;
      allAnswers.forEach((ans, i) => {
        text += `${String.fromCharCode(65 + i)}. ${ans}\n`;
      });
      text += `\n_Reply with the correct answer!_`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch trivia question', msg);
    }
  }
};
