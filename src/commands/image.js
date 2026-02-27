import axios from 'axios';
import { sendText, sendImage } from '../modules/connection.js';

export default {
  name: 'image',
  aliases: ['img', 'search'],
  category: 'media',
  description: 'Search for images',
  usage: '!image <query>',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, args, msg }) => {
    if (args.length === 0) {
      await sendText(fromJid, '❌ Please provide a search query!\nUsage: !image <query>', msg);
      return;
    }

    const query = args.join(' ');
    
    try {
      await sendText(fromJid, `🔍 Searching for "${query}"...`, msg);
      
      // Using Unsplash API for free image search
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=1`,
        {
          headers: {
            'Authorization': 'Client-ID demo'
          }
        }
      );

      // Fallback to Pexels if Unsplash fails
      if (!response.data || response.data.length === 0) {
        throw new Error('No results');
      }
      
      const imageData = response.data;
      
      // Send the image
      await sendImage(
        fromJid, 
        { url: imageData.urls.regular }, 
        `*${query}*\n📷 by ${imageData.user.name}`, 
        msg
      );
      
    } catch (error) {
      // Fallback: try Pexels or send text result
      try {
        const pexelsResponse = await axios.get(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
          {
            headers: { 'Authorization': 'demo' }
          }
        );
        
        if (pexelsResponse.data.photos && pexelsResponse.data.photos.length > 0) {
          const photo = pexelsResponse.data.photos[0];
          await sendImage(
            fromJid,
            { url: photo.src.large },
            `*${query}*\n📷 by ${photo.photographer}`,
            msg
          );
        } else {
          await sendText(fromJid, `❌ No images found for "${query}"`, msg);
        }
      } catch (pexelsError) {
        let text = `╭─「 *IMAGE SEARCH* 」\n`;
        text += `│ Search: ${query}\n\n`;
        text += `│ 🔗 Google Images: https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch\n`;
        text += `╰────────────⦁`;
        await sendText(fromJid, text, msg);
      }
    }
  }
};
