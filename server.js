import express from 'express';
import { config } from './src/config.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: config.bot.name,
    version: config.bot.version,
    uptime: process.uptime()
  });
});

// QR Code endpoint (if available)
app.get('/qr', (req, res) => {
  res.json({
    message: 'Scan QR code from bot terminal',
    instructions: 'The QR code is displayed in the terminal when starting the bot'
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    bot: config.bot.name,
    prefix: config.bot.prefix,
    version: config.bot.version,
    settings: config.settings,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Status: http://localhost:${PORT}/status`);
});

export default app;
