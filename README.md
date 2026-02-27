<div align="center">

<img src="assets/WhatsApp%20Image%202026-02-27%20at%2015.43.32.jpeg" alt="VenomBot Banner" width="100%" />

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=28&pause=1000&color=4ECDC4&center=true&vCenter=true&width=900&lines=VenomBot+Tech+%7C+Professional+WhatsApp+Bot;Modern+Baileys+Bot+with+60%2B+Commands;QR+%2B+Pairing+Auth+%7C+Cloud+Ready+%7C+Open+Source" alt="Typing SVG" />

<table>
  <tr>
    <td align="center">
      <b>Repository</b><br/><br/>
      <a href="https://github.com/Fellix-234/VenomBot-Tech/stargazers"><img src="https://img.shields.io/github/stars/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github&color=facc15" alt="Stars"/></a>
      <a href="https://github.com/Fellix-234/VenomBot-Tech/network/members"><img src="https://img.shields.io/github/forks/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github&color=f97316" alt="Forks"/></a>
      <a href="https://github.com/Fellix-234/VenomBot-Tech/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Fellix-234/VenomBot-Tech?style=for-the-badge&color=ef4444" alt="License"/></a>
      <img src="https://img.shields.io/badge/Node.js-18%2B-22c55e?style=for-the-badge&logo=node.js" alt="Node"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>Live Access</b><br/><br/>
      <a href="https://venombot-tech.onrender.com/session"><img src="https://img.shields.io/badge/Get%20Session-Live%20Auth%20Page-2563eb?style=for-the-badge&logo=whatsapp" alt="Session"/></a>
      <a href="https://venombot-tech.onrender.com/"><img src="https://img.shields.io/badge/Status-Live%20Dashboard-10b981?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Status"/></a>
      <a href="https://venombot-tech.onrender.com/health"><img src="https://img.shields.io/badge/Health-API%20OK-0ea5e9?style=for-the-badge&logo=vercel&logoColor=white" alt="Health"/></a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>One-Click Deploy</b><br/><br/>
      <a href="https://render.com/deploy?repo=https://github.com/Fellix-234/VenomBot-Tech"><img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=000" alt="Render"/></a>
      <a href="https://railway.app/new?template=https://github.com/Fellix-234/VenomBot-Tech"><img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway" alt="Railway"/></a>
      <a href="https://replit.com/github/Fellix-234/VenomBot-Tech"><img src="https://img.shields.io/badge/Deploy-Replit-F26207?style=for-the-badge&logo=replit&logoColor=fff" alt="Replit"/></a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>Quick Actions</b><br/><br/>
      <a href="https://wa.me/254725391914"><img src="https://img.shields.io/badge/WhatsApp-Dev%201-25d366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp Dev 1"/></a>
      <a href="https://wa.me/254701881604"><img src="https://img.shields.io/badge/WhatsApp-Dev%202-25d366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp Dev 2"/></a>
      <a href="https://github.com/Fellix-234/VenomBot-Tech/issues"><img src="https://img.shields.io/badge/Issues-Report%20Bug-ff6b6b?style=for-the-badge&logo=github&logoColor=white" alt="Issues"/></a>
      <a href="https://github.com/Fellix-234/VenomBot-Tech/blob/main/CONTRIBUTING.md"><img src="https://img.shields.io/badge/Contribute-Help%20Out-8b5cf6?style=for-the-badge&logo=github&logoColor=white" alt="Contributing"/></a>
    </td>
  </tr>
</table>

</div>

---

## What is VenomBot Tech?

VenomBot Tech is a production-ready WhatsApp bot built with Baileys, designed for modern multi-device sessions, group management, automation, and media/fun commands.

### Highlights
- 60+ commands across utility, admin, media, and fun categories
- Live web session page with QR and pairing authentication
- Auto features: autoread, autotyping, autorecording, autoreact
- Group moderation tools: kick, promote, demote, tag, anti-link
- JSON + MongoDB support with fallback architecture
- Cloud-ready for Render, Railway, Replit, Heroku, VPS

---

## Live Session & Dashboard

- Session page: https://venombot-tech.onrender.com/session
- Status page: https://venombot-tech.onrender.com/
- Health endpoint: https://venombot-tech.onrender.com/health

---

## Quick Start

### 1) Clone
```bash
git clone https://github.com/Fellix-234/VenomBot-Tech.git
cd VenomBot-Tech
```

### 2) Install
```bash
npm install
```

### 3) Configure
```bash
cp .env.example .env
```

Edit `.env` and set at least:
- `BOT_NAME`
- `PREFIX`
- `OWNER_NUMBER` (your WhatsApp number with country code)

### 4) Run
```bash
npm start
```

### 5) Connect
Open:
- `http://localhost:3000/session`

Then link with either:
- QR Code scan
- Pairing code by phone number

---

## Core Commands

| Category | Examples |
|---|---|
| General | `!help`, `!ping`, `!info`, `!uptime`, `!owner` |
| Group | `!tag`, `!kick`, `!promote`, `!demote`, `!groupinfo` |
| Media | `!sticker`, `!image`, `!lyrics`, `!youtube`, `!spotify` |
| Fun | `!8ball`, `!dice`, `!flip`, `!choose`, `!trivia`, `!meme` |
| Utility | `!weather`, `!calc`, `!crypto`, `!password`, `!qrgen` |
| AI / Search | `!gpt`, `!wikipedia`, `!define`, `!news` |

> Full command files are in `src/commands/`.

---

## Project Structure

```text
VenomBot-Tech/
├── src/
│   ├── commands/
│   ├── database/
│   ├── modules/
│   ├── utils/
│   └── config.js
├── assets/
├── index.js
├── package.json
└── README.md
```

---

## Deployment

Use the complete deployment guide:
- [DEPLOYMENT.md](DEPLOYMENT.md)

Supports:
- Render
- Railway
- Replit
- Heroku
- VPS / Local Server

---

## Developers

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="assets/WhatsApp%20Image%202026-02-27%20at%2015.42.21.jpeg" width="100" height="100" alt="Developer 1"/>
      <br/>
      <b>Wondering Jew</b>
      <br/>
      <a href="https://wa.me/254725391914">WhatsApp</a>
    </td>
    <td align="center">
      <img src="assets/WhatsApp%20Image%202026-02-27%20at%2015.42.22.jpeg" width="100" height="100" alt="Developer 2"/>
      <br/>
      <b>Warrior Felix</b>
      <br/>
      <a href="https://wa.me/254701881604">WhatsApp</a>
    </td>
  </tr>
</table>

</div>

---

## Community & Support

- Issues: https://github.com/Fellix-234/VenomBot-Tech/issues
- Contributing Guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- License: [LICENSE](LICENSE)

---

<div align="center">

### If this project helped you, please star and fork it.

<a href="https://github.com/Fellix-234/VenomBot-Tech">Star</a> • <a href="https://github.com/Fellix-234/VenomBot-Tech/fork">Fork</a>

</div>
