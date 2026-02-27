import { sendText, sendImage, getProfilePicture, getSocket } from '../modules/connection.js';

export default {
  name: 'profile',
  aliases: ['pp', 'avatar'],
  category: 'utility',
  description: 'Get user profile picture',
  usage: '!profile [@user]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args, sock }) => {
    let targetJid = fromJid;
    
    // Check if user mentioned someone
    if (args.length > 0) {
      const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (mentioned) {
        targetJid = mentioned;
      }
    }
    
    try {
      const profilePic = await getProfilePicture(targetJid);
      
      if (profilePic) {
        const userNumber = targetJid.split('@')[0];
        await sendImage(
          fromJid, 
          { url: profilePic }, 
          `*Profile Picture of ${userNumber}*`, 
          msg
        );
      } else {
        await sendText(fromJid, '❌ User has no profile picture or is private.', msg);
      }
    } catch (error) {
      await sendText(fromJid, '❌ Unable to get profile picture.', msg);
    }
  }
};
