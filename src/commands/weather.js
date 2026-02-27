import axios from 'axios';
import { config } from '../config.js';
import { sendText } from '../modules/connection.js';

export default {
  name: 'weather',
  aliases: ['w'],
  category: 'utility',
  description: 'Get weather information for a city',
  usage: '!weather <city>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a city name!\nUsage: !weather <city>', msg);
      return;
    }

    const city = args.join(' ');
    const apiKey = config.apiKeys.weather;
    
    try {
      // Using OpenWeatherMap API (free tier)
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );

      const data = response.data;
      
      const text = `╭─「 *WEATHER* 」\n`;
      text += `│ • *City:* ${data.name}, ${data.sys.country}\n`;
      text += `│ • *Temperature:* ${Math.round(data.main.temp)}°C\n`;
      text += `│ • *Feels Like:* ${Math.round(data.main.feels_like)}°C\n`;
      text += `│ • *Humidity:* ${data.main.humidity}%\n`;
      text += `│ • *Wind Speed:* ${data.wind.speed} m/s\n`;
      text += `│ • *Condition:* ${data.weather[0].description}\n`;
      text += `╰────────────⦁`;

      await sendText(fromJid, text, msg);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        await sendText(fromJid, '❌ City not found! Please check the spelling.', msg);
      } else if (error.response && error.response.status === 401) {
        await sendText(fromJid, '❌ Weather API key not configured. Please set WEATHER_API_KEY in .env', msg);
      } else {
        await sendText(fromJid, '❌ Unable to get weather information. Please try again later.', msg);
      }
    }
  }
};
