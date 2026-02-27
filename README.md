# VenomBot Tech - Professional WhatsApp Bot

![VenomBot Banner](assets/WhatsApp%20Image%202026-02-27%20at%2015.43.32.jpeg)

<p align="center">
  <a href="https://github.com/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/github/stars/Fellix-234/VenomBot-Tech?style=flat-square&color=yellow&logo=github" alt="Stars">
  </a>
  <a href="https://github.com/Fellix-234/VenomBot-Tech/fork">
    <img src="https://img.shields.io/github/forks/Fellix-234/VenomBot-Tech?style=flat-square&color=orange&logo=github" alt="Forks">
  </a>
  <a href="https://github.com/Fellix-234/VenomBot-Tech/followers">
    <img src="https://img.shields.io/github/followers/Fellix-234?style=flat-square&color=blue&logo=github" alt="Followers">
  </a>
  <img src="https://img.shields.io/node/v/baileys?style=flat-square&color=green" alt="Node.js">
  <img src="https://img.shields.io/github/license/Fellix-234/VenomBot-Tech?style=flat-square&color=red" alt="License">
</p>

<p align="center">
  <a href="https://repl.it/github/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Repl.it-Deploy-black?style=for-the-badge&logo=replit" alt="Replit">
  </a>
  <a href="https://heroku.com/deploy?template=https://github.com/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Heroku-Deploy-purple?style=for-the-badge&logo=heroku" alt="Heroku">
  </a>
  <a href="https://railway.app/new?template=https://github.com/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Railway-Deploy-gray?style=for-the-badge&logo=railway" alt="Railway">
  </a>
</p>

<p align="center">
  <a href="https://repl.it/github/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Get_Session-QR_Code-blue?style=for-the-badge" alt="Get Session">
  </a>
</p>

<h3 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=00FF00&center=true&vCenter=true&width=435&lines=Professional+WhatsApp+Bot;45%2B+Commands;Group+Management;Auto+Features;Message+Logging;Open+Source" alt="Typing SVG" />
</h3>

A powerful, feature-rich WhatsApp bot built with Baileys. Easy to use, highly customizable, and production-ready.

## Features

- 🤖 **Intelligent Commands** - 45+ commands covering various functionalities
- 👥 **Group Management** - Kick, promote, demote, tag, and manage groups
- 🎭 **Fun Commands** - Memes, jokes, facts, quotes, and more
- 📱 **Media Tools** - Image search, YouTube, sticker conversion, lyrics
- ⚡ **Auto Features** - Auto-read, auto-typing, auto-reaction, message logging
- 🛡️ **Security** - Anti-link, rate limiting, owner-only commands
- 📊 **Database** - JSON/MongoDB support with message logging
- 🎨 **Customizable** - Easy to configure and extend

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/VenomBot-Tech/VenomBot-Tech
cd VenomBot-Tech
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
BOT_NAME=VenomBot
PREFIX=!
OWNER_NUMBER=1234567890
TIMEZONE=Asia/Kolkata
USE_JSON_DB=true
AUTO_READ=true
AUTO_TYPING=true
```

## Running the Bot

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Commands

### General Commands

| Command | Alias | Description |
| --- | --- | --- |
| `!help` | h, menu | Show all commands |
| `!ping` | p, speed | Check bot response time |
| `!info` | botinfo | Display bot information |
| `!owner` | creator | Show owner information |
| `!afk` | away | Set AFK status |

### Group Commands

| Command | Alias | Description |
| --- | --- | --- |
| `!tag` | tagall | Tag all group members |
| `!kick` | remove | Kick member from group |
| `!promote` | admin | Promote member to admin |
| `!demote` | unadmin | Demote admin to member |
| `!groupinfo` | ginfo | Get group information |

### Media Commands

| Command | Alias | Description |
| --- | --- | --- |
| `!sticker` | s, stiker | Convert image to sticker |

## Project Structure

```text
VenomBot-Tech/
├── src/
│   ├── commands/           # Command files
│   ├── database/           # Database configuration
│   ├── modules/            # Core modules
│   ├── utils/              # Utility functions
│   └── config.js           # Configuration
├── index.js                # Main entry point
├── package.json            # Dependencies
└── README.md               # This file
```

## Creating Custom Commands

Create a new file in `src/commands/` folder:

```javascript
import { sendText } from '../modules/connection.js';

export default {
  name: 'mycommand',
  aliases: ['mycmd'],
  category: 'general',
  description: 'My awesome command',
  usage: '!mycommand [args]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ fromJid, msg, args }) => {
    await sendText(fromJid, 'Hello!', msg);
  }
};
```

## Database Operations

### Using JSON Database

```javascript
import { db } from '../database/db.js';

// Add user
db.addUser('1234567890', { name: 'John' });

// Get user
const user = db.getUser('1234567890');

// Log message
db.logMessage(sender, chat, text, 'text');
```

## Troubleshooting

### QR Code not appearing

- Ensure terminal supports color output
- Update Baileys: `npm install @whiskeysockets/baileys@latest`

### Commands not loading

- Verify command files export default with all required properties
- Check file syntax in logs

### Rate limiting issues

- Increase `maxCommands` in `src/config.js`

## License

MIT License - Copyright (c) 2024 VenomBot Tech

## Asset Usage

Your bot uses custom assets from the `/assets` folder in various commands:

- **!help** (Menu Command) - Displays with `WhatsApp Image 2026-02-27 at 15.42.21.jpeg`
- **!alive** (Bot Status) - Displays with random asset from folder  
- **!status** (Bot Settings) - Displays with `WhatsApp Image 2026-02-27 at 15.42.22.jpeg`
- **!repo** (Repository Info) - Displays with `WhatsApp Image 2026-02-27 at 15.42.23.jpeg`
- **README Banner** - GitHub display with `WhatsApp Image 2026-02-27 at 15.43.32.jpeg`

To customize these images, replace the files in the `assets/` folder with your own images.

---

## 👨‍💻 Developers

<div align="center">

### Core Team

<table>
  <tr>
    <td align="center">
      <img src="assets/WhatsApp%20Image%202026-02-27%20at%2015.42.21.jpeg" width="100" height="100" style="border-radius: 50%; border: 3px solid #00ff00;">
      <br>
      <sub><b>Wondering Jew</b></sub>
      <br>
      <a href="https://wa.me/254725391914">
        <img src="https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp">
      </a>
      <br>
      <code>254725391914</code>
    </td>
    <td align="center">
      <img src="assets/WhatsApp%20Image%202026-02-27%20at%2015.42.22.jpeg" width="100" height="100" style="border-radius: 50%; border: 3px solid #00ff00;">
      <br>
      <sub><b>Warrior Felix</b></sub>
      <br>
      <a href="https://wa.me/254701881604">
        <img src="https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp">
      </a>
      <br>
      <code>254701881604</code>
    </td>
  </tr>
</table>

</div>

---

## Support

- Report bugs on [GitHub Issues](https://github.com/Fellix-234/VenomBot-Tech/issues)
- Join our WhatsApp Community

---

Made with ❤️ by VenomBot Tech
