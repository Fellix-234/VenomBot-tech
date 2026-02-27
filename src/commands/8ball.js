import { sendText } from '../modules/connection.js';

const responses = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful'
];

export default {
  name: '8ball',
  aliases: ['eightball', 'magic8'],
  category: 'fun',
  description: 'Ask the magic 8 ball a question',
  usage: '!8ball [question]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (!args.length) {
      await sendText(fromJid, '❌ Please ask a yes/no question!\n\nExample: !8ball Will I pass my exam?', msg);
      return;
    }
    
    const question = args.join(' ');
    const answer = responses[Math.floor(Math.random() * responses.length)];
    
    let text = `🔮 *Magic 8 Ball*\n\n`;
    text += `*Question:* ${question}\n\n`;
    text += `*Answer:* ${answer}`;
    
    await sendText(fromJid, text, msg);
  }
};
