import { sendText } from '../modules/connection.js';

const liveBaseUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || 'https://venombot-tech-1.onrender.com';

export default {
  name: 'deploy',
  aliases: ['deployment', 'host', 'live'],
  category: 'tools',
  description: 'Show professional deployment endpoints and onboarding links',
  usage: '!deploy',
  ownerOnly: false,
  groupOnly: false,

  execute: async ({ fromJid, msg }) => {
    let text = '';
    text += `╔════════════════════════════════════════════╗\n`;
    text += `║          🚀 DEPLOYMENT ENDPOINTS           ║\n`;
    text += `╚════════════════════════════════════════════╝\n\n`;

    text += `🌐 *Live Base URL*\n`;
    text += `${liveBaseUrl}\n\n`;

    text += `🔗 *Production Endpoints*\n`;
    text += `• Health: ${liveBaseUrl}/health\n`;
    text += `• Status: ${liveBaseUrl}/status\n`;
    text += `• Session: ${liveBaseUrl}/session\n`;
    text += `• QR: ${liveBaseUrl}/qr\n`;
    text += `• Session API: ${liveBaseUrl}/api/session-status?sessionId=VenomBot-User-01\n\n`;

    text += `👥 *User Session Link Pattern*\n`;
    text += `${liveBaseUrl}/session?sid=VenomBot-User-01\n\n`;

    text += `📌 *Tip:* Give each user a unique SID for isolated sessions.`;

    await sendText(fromJid, text, msg);
  },
};
