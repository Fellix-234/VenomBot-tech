import { sendText } from '../modules/connection.js';
import axios from 'axios';

export default {
  name: 'crypto',
  aliases: ['bitcoin', 'btc', 'coin'],
  category: 'utility',
  description: 'Get cryptocurrency prices',
  usage: '!crypto [coin] (default: bitcoin)',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    try {
      const coin = args[0] || 'bitcoin';
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,eur&include_24hr_change=true`);
      
      if (!response.data[coin]) {
        await sendText(fromJid, '❌ Cryptocurrency not found! Try: bitcoin, ethereum, dogecoin', msg);
        return;
      }
      
      const data = response.data[coin];
      const change = data.usd_24h_change ? data.usd_24h_change.toFixed(2) : '0';
      const emoji = change > 0 ? '📈' : '📉';
      
      let text = `💰 *Crypto Price - ${coin.toUpperCase()}*\n\n`;
      text += `💵 USD: $${data.usd.toLocaleString()}\n`;
      text += `💶 EUR: €${data.eur.toLocaleString()}\n`;
      text += `${emoji} 24h Change: ${change}%\n`;
      
      await sendText(fromJid, text, msg);
    } catch (error) {
      await sendText(fromJid, '❌ Failed to fetch crypto data', msg);
    }
  }
};
