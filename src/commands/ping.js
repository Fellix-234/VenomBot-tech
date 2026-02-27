import { sendText } from '../modules/connection.js';

export default {
  name: 'ping',
  aliases: ['p', 'speed'],
  category: 'general',
  description: 'Check bot response time',
  usage: '!ping',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg }) => {
    const start = Date.now();
    await sendText(fromJid, '🏓 Pinging...', msg);
    const end = Date.now();
    
    const latency = end - start;
    let emoji = '🟢';
    if (latency > 500) emoji = '🟡';
    if (latency > 1000) emoji = '🔴';
    
    const response = `${emoji} *Pong!*\n\n` +
                    `• *Response Time:* ${latency}ms\n` +
                    `• *Status:* ${latency < 500 ? 'Excellent' : latency < 1000 ? 'Good' : 'Slow'}`;
    
    await sendText(fromJid, response, msg);
  }
};
