# VenomBot Tech

![VenomBot Tech Banner](assets/WhatsApp%20Image%202026-02-27%20at%2015.43.32.jpeg)

![Typing Animation](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=24&pause=1200&color=22C55E&width=1000&lines=Professional+WhatsApp+Automation;Session+Panel+First+Architecture;Multi-Session+Ready+for+Teams;Deploy+Fast+on+Render+%7C+Railway+%7C+Replit)

**Professional WhatsApp Bot** • Multi-session onboarding • Cloud-ready deployment

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](#quick-start)
[![License](https://img.shields.io/github/license/Fellix-234/VenomBot-Tech?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech/stargazers)
[![Forks](https://img.shields.io/github/forks/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech/network/members)

[![Last Commit](https://img.shields.io/github/last-commit/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech)
[![Issues](https://img.shields.io/github/issues/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech/issues)
[![PRs](https://img.shields.io/github/issues-pr/Fellix-234/VenomBot-Tech?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech/pulls)

[![Live Status](https://img.shields.io/badge/Live%20Status-Open-10b981?style=for-the-badge&logo=google-chrome&logoColor=white)](https://venombot-tech-1.onrender.com/)
[![Session Panel](https://img.shields.io/badge/Session%20Panel-Open-2563eb?style=for-the-badge&logo=whatsapp&logoColor=white)](https://venombot-tech-1.onrender.com/session)
[![Health](https://img.shields.io/badge/Health-API%20OK-0ea5e9?style=for-the-badge&logo=vercel&logoColor=white)](https://venombot-tech-1.onrender.com/health)

[![Deploy to Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=000)](https://render.com/deploy?repo=https://github.com/Fellix-234/VenomBot-Tech)
[![Deploy to Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://railway.app/new?template=https://github.com/Fellix-234/VenomBot-Tech)
[![Deploy to Replit](https://img.shields.io/badge/Deploy-Replit-F26207?style=for-the-badge&logo=replit&logoColor=fff)](https://replit.com/github/Fellix-234/VenomBot-Tech)

---

## Quick Navigation

- [Overview](#overview)
- [Quick Access](#quick-access)
- [Quick Start](#quick-start)
- [Session Architecture](#session-architecture)
- [Command Highlights](#command-highlights)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Community & Support](#community--support)

---

## Overview

VenomBot Tech is a production-ready WhatsApp bot powered by Baileys with a professional web onboarding flow, rich command ecosystem, and deployment-friendly architecture.

### Why this bot

- Professional session panel (`/session`) for user onboarding
- Multi-session architecture with isolated session IDs
- 80+ commands across utility, admin, fun, and media
- JSON database with MongoDB fallback support
- Stable startup and reconnect handling
- Ready for Render, Railway, Replit, and VPS hosting

### Stack Snapshot

![Baileys](https://img.shields.io/badge/Baileys-WhatsApp%20MD-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?style=flat-square&logo=express&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Render](https://img.shields.io/badge/Hosting-Render-46E3B7?style=flat-square&logo=render&logoColor=000)
![Database](https://img.shields.io/badge/Database-JSON%20%2F%20MongoDB-0ea5e9?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-f43f5e?style=flat-square)

---

## Quick Access

- **Live App:** [venombot-tech-1.onrender.com](https://venombot-tech-1.onrender.com/)
- **Session Panel:** [/session](https://venombot-tech-1.onrender.com/session)
- **Health API:** [/health](https://venombot-tech-1.onrender.com/health)
- **Status API:** [/status](https://venombot-tech-1.onrender.com/status)

---

## Quick Start

### 1) Clone

```bash
git clone https://github.com/Fellix-234/VenomBot-Tech.git
cd VenomBot-Tech
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create `.env` from `.env.example` and set at least:

- `BOT_NAME`
- `PREFIX`
- `OWNER_NUMBER`
- `MAIN_BOT_ENABLED=false` (recommended for session-panel mode)

### 4) Start bot

```bash
npm start
```

### 5) Onboard users

Open:

- `http://localhost:3000/session`

Give each user a unique session link:

- `http://localhost:3000/session?sid=VenomBot-User-01`

---

## Session Architecture

- The app runs best in **Session Panel Mode** (`MAIN_BOT_ENABLED=false`)
- Staff/users pair their own sessions from the `/session` page
- Every `sid` is isolated and managed independently
- Pairing can be done by QR or phone-number code from the panel

### Session Flow

1. Open the session panel URL
2. Create or receive a unique `sid`
3. Pair using QR or phone-number code
4. Verify session status via API endpoint
5. Manage user sessions independently

---

## Command Highlights

| Category | Examples |
| --- | --- |
| General | `!help`, `!ping`, `!info`, `!uptime`, `!owner` |
| Admin/Group | `!tag`, `!kick`, `!promote`, `!demote`, `!groupinfo` |
| Utilities | `!weather`, `!calc`, `!crypto`, `!password`, `!qrgen` |
| Media | `!sticker`, `!image`, `!lyrics`, `!song`, `!youtube` |
| AI/Search | `!gpt`, `!wikipedia`, `!define`, `!news` |
| Professional | `!dashboard`, `!support`, `!deploy` |

All commands are located in `src/commands/`.

---

## Deployment

Use the full deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md).

### Supported targets

- Render
- Railway
- Replit
- Heroku
- VPS / Dedicated server

### Recommended Production Mode

- Use **Session Panel Mode** with `MAIN_BOT_ENABLED=false`
- Keep one isolated `sid` per staff/user
- Use health and status endpoints in your deployment monitor

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
├── auth_info_baileys/
├── index.js
├── server.js
└── README.md
```

---

## GitHub Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=Fellix-234&repo=VenomBot-Tech&show_icons=true&theme=tokyonight&hide_border=true&count_private=true)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=Fellix-234&layout=compact&theme=tokyonight&hide_border=true)

![Streak Stats](https://github-readme-streak-stats.herokuapp.com/?user=Fellix-234&theme=tokyonight&hide_border=true)

---

## Developers

[![Wondering Jew](https://img.shields.io/badge/WhatsApp-Wondering%20Jew-25d366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/254725391914)
[![Warrior Felix](https://img.shields.io/badge/WhatsApp-Warrior%20Felix-25d366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/254701881604)

---

## Community & Support

- Report issues: [GitHub Issues](https://github.com/Fellix-234/VenomBot-Tech/issues)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- License: [LICENSE](LICENSE)

---

## Maintained With

[![Maintenance](https://img.shields.io/badge/Maintained-Yes-22c55e?style=for-the-badge)](https://github.com/Fellix-234/VenomBot-Tech)
[![Open Source](https://img.shields.io/badge/Open%20Source-Community%20Driven-2563eb?style=for-the-badge)](https://github.com/Fellix-234/VenomBot-Tech)
[![Contributions](https://img.shields.io/badge/Contributions-Welcome-f59e0b?style=for-the-badge)](CONTRIBUTING.md)

---

If this project helps you, please support it:

[![Star Repo](https://img.shields.io/badge/⭐%20Star%20Repo-GitHub-black?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech)
[![Fork Repo](https://img.shields.io/badge/🍴%20Fork%20Repo-GitHub-1f6feb?style=for-the-badge&logo=github)](https://github.com/Fellix-234/VenomBot-Tech/fork)
