import { sendText } from '../modules/connection.js';

export default {
  name: 'age',
  aliases: ['birthday', 'howold'],
  category: 'utility',
  description: 'Calculate age from birth date',
  usage: '!age [YYYY-MM-DD]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    if (!args.length) {
      await sendText(fromJid, '❌ Please provide birth date\n\nExample: !age 2000-01-15', msg);
      return;
    }
    
    const birthDate = new Date(args[0]);
    
    if (isNaN(birthDate.getTime())) {
      await sendText(fromJid, '❌ Invalid date format! Use YYYY-MM-DD\n\nExample: !age 2000-01-15', msg);
      return;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    
    let text = `🎂 *Age Calculator*\n\n`;
    text += `Birth Date: ${birthDate.toLocaleDateString()}\n`;
    text += `Current Age: *${age} years old*\n`;
    text += `Days until next birthday: ${daysUntil} days`;
    
    await sendText(fromJid, text, msg);
  }
};
