# 🤖 VenomBot Tech - Professional WhatsApp Bot

![VenomBot Banner](assets/WhatsApp%20Image%202026-02-27%20at%2015.43.32.jpeg)

<p align="center">
  <a href="https://github.com/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/github/stars/Fellix-234/VenomBot-Tech?style=flat-square&color=yellow&logo=github" alt="Stars">
  </a>
  <a href="https://github.com/Fellix-234/VenomBot-Tech/fork">
    <img src="https://img.shields.io/github/forks/Fellix-234/VenomBot-Tech?style=flat-square&color=orange&logo=github" alt="Forks">
  </a>
  <a href="https://github.com/Fellix-234/VenomBot-Tech/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Fellix-234/VenomBot-Tech?style=flat-square&color=red" alt="License">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Status">
</p>

<h3 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=00FF00&center=true&vCenter=true&width=500&lines=Professional+WhatsApp+Bot;45%2B+Commands;Group+Management;Auto+Features;Message+Logging;100%25+Open+Source" alt="Typing SVG" />
</h3>

> A powerful, feature-rich WhatsApp bot built with Baileys. Easy to deploy, highly customizable, and production-ready.

---

## 🚀 Quick Deploy

Choose your platform and deploy in just 1 click:

<p align="center">
  <a href="https://render.com/deploy?repo=https://github.com/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Deploy%20on-Render-46E3B7?style=for-the-badge&logo=render" alt="Deploy on Render">
  </a>
  <a href="https://railway.app/new?template=https://github.com/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Deploy%20on-Railway-0B0D0E?style=for-the-badge&logo=railway" alt="Deploy on Railway">
  </a>
  <a href="https://replit.com/github/Fellix-234/VenomBot-Tech">
    <img src="https://img.shields.io/badge/Deploy%20on-Replit-F26207?style=for-the-badge&logo=replit" alt="Deploy on Replit">
  </a>
</p>

📖 **Read [DEPLOYMENT.md](DEPLOYMENT.md)** for detailed guides on all platforms (Render, Railway, Heroku, Replit, VPS, Local Server)

## ✨ Features

- **🎯 45+ Commands** - Covering everything from fun to utility
- **👥 Group Management** - Kick, promote, demote, tag members
- **🎭 Entertainment** - Memes, jokes, facts, quotes, and more
- **📱 Media Tools** - Image search, YouTube, sticker conversion, lyrics
- **⚡ Smart Features** - Auto-read, auto-typing, auto-reaction, message logging
- **🔒 Security** - Anti-link, rate limiting, admin-only commands
- **💾 Database** - JSON + MongoDB support with message logging
- **🎨 Customizable** - Easy to modify and extend commands
- **🌐 Multi-Device** - True multi-device WhatsApp protocol support
- **📊 Dashboard** - Beautiful web interface to monitor bot status

## 📦 Installation & Setup

### Option 1: Deploy to Cloud (Recommended)

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step guides:
- **Render** (Free tier available, recommended)
- **Railway** (Easy & fast)
- **Replit** (Quick testing)
- **Heroku** (Paid plans only)
- **VPS / Self-hosted** (Full control)

### Option 2: Local/Development Setup

#### Requirements
- Node.js 18+ ([Download](https://nodejs.org))
- Git ([Download](https://git-scm.com))

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fellix-234/VenomBot-Tech.git
   cd VenomBot-Tech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Run the bot**
   ```bash
   npm start
   ```

5. **Scan QR Code**
   - Open browser to `http://localhost:3000/qr`
   - Scan with WhatsApp to connect

---

## ⚙️ Configuration

Edit `.env` file to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `BOT_NAME` | VenomBot | Display name |
| `PREFIX` | ! | Command prefix |
| `OWNER_NUMBER` | - | Owner's WhatsApp number (optional) |
| `AUTO_READ` | true | Auto-read messages |
| `AUTO_TYPING` | true | Show typing indicator |
| `AUTO_REACT` | true | Auto-react to messages |
| `ANTI_LINK` | false | Block link sharing |
| `USE_JSON_DB` | true | Use JSON database (false = MongoDB) |
| `MONGODB_URI` | - | MongoDB connection string |

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

## 🤝 Contributing

We love contributions! Whether it's bug reports, feature requests, or code improvements:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Community

- 📖 **Documentation**: Check [DEPLOYMENT.md](DEPLOYMENT.md) and [CONTRIBUTING.md](CONTRIBUTING.md)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/Fellix-234/VenomBot-Tech/issues)
- 💬 **Questions**: Open a GitHub discussion
- 📧 **Email**: Contact maintainers via GitHub

---

## ⭐ Star History

If you find this project helpful, please consider starring it! ⭐

---

## 📌 Important Notes

### Multi-Device Setup
The bot uses WhatsApp's native multi-device protocol via Baileys. For the bot to work independently:
1. Use a **separate WhatsApp account** (virtual number or second phone)
2. Deploy to a cloud platform (Render, Railway, etc.)
3. Scan the QR code with the separate WhatsApp number

### Privacy & Security
- Never share your `.env` file or QR code
- Keep your MongoDB credentials secure
- Use environment variables for sensitive data
- Review [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## 🙏 Acknowledgments

- Built with [Baileys](https://github.com/whiskeysockets/Baileys)
- Powered by Node.js and Express
- Hosted on Render, Railway, and other platforms

---

<p align="center">
  <b>Made with ❤️ by VenomBot Tech</b>
  <br>
  <a href="https://github.com/Fellix-234/VenomBot-Tech">⭐ Star on GitHub</a>
  •
  <a href="https://github.com/Fellix-234/VenomBot-Tech/fork">🍴 Fork</a>
  •
  <a href="https://github.com/Fellix-234/VenomBot-Tech/issues">🐛 Report Bug</a>
</p>
