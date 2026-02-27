# Quick Deployment Guides

This document contains step-by-step guides to deploy VenomBot Tech on various platforms.

## Table of Contents
1. [Render](#render)
2. [Railway](#railway)
3. [Heroku](#heroku)
4. [Replit](#replit)
5. [VPS / Local Server](#vps--local-server)

---

## Render

Render is the **recommended** platform for this bot.

### Steps:

1. **Fork the repository**
   - Go to https://github.com/Fellix-234/VenomBot-Tech
   - Click "Fork" button

2. **Create Render account**
   - Visit https://render.com
   - Sign up with GitHub

3. **Create new Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select your forked VenomBot-Tech repo

4. **Configure**
   - **Name**: venombot-tech (or your preference)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free or Paid

5. **Environment Variables**
   - Add the following:
     ```
     BOT_NAME=VenomBot
     PREFIX=!
     NODEJS_VERSION=20
     ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Your bot is live! Get URL from dashboard

7. **Get QR Code**
   - Visit: `YOUR-RENDER-URL.onrender.com/qr`
   - Scan with WhatsApp to connect

---

## Railway

Fast and reliable deployment.

### Steps:

1. **Fork repository** (as above)

2. **Create Railway account**
   - Visit https://railway.app
   - Sign up with GitHub

3. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose VenomBot-Tech fork

4. **Configure**
   - Railway auto-detects Node.js
   - Set start command in `package.json` (already done: `npm start`)

5. **Environment Variables**
   - Click your service
   - Go to "Variables"
   - Add:
     ```
     BOT_NAME=VenomBot
     PREFIX=!
     PORT=3000
     ```

6. **Deploy**
   - Click "Deploy"
   - View logs in dashboard

7. **Access bot**
   - Railway assigns a domain automatically
   - Visit `YOUR-RAILWAY-URL/qr` to scan QR code

---

## Heroku

Traditional Node.js hosting (requires paid dyno now).

### Steps:

1. **Install Heroku CLI**
   - Download from https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create new app**
   ```bash
   heroku create your-bot-name
   ```

4. **Set environment variables**
   ```bash
   heroku config:set BOT_NAME=VenomBot PREFIX=!
   ```

5. **Deploy code**
   ```bash
   git push heroku main
   ```

6. **View logs**
   ```bash
   heroku logs --tail
   ```

7. **Access bot**
   - Visit: `your-bot-name.herokuapp.com/qr`

---

## Replit

Perfect for quick testing and learning.

### Steps:

1. **Open Replit**
   - Visit https://replit.com

2. **Create new Repl**
   - Click "+" to create new
   - Search for "Node.js"
   - Or click "Import from GitHub"
   - Paste: `https://github.com/Fellix-234/VenomBot-Tech`

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure .env**
   - Create `.env` file (top left)
   - Add:
     ```
     BOT_NAME=VenomBot
     PREFIX=!
     PORT=3000
     ```

5. **Run bot**
   - Click "Run" button
   - Or type: `npm start`

6. **Get QR code**
   - Click "Webview" tab (top right)
   - Visit `http://localhost:3000/qr`
   - Scan with WhatsApp

7. **Keep running 24/7**
   - Upgrade to Replit Boosts (paid)
   - Or use a service like UpTimeRobot to ping bot regularly

---

## VPS / Local Server

For full control on your own server.

### Requirements:
- VPS with Node.js 18+ installed
- SSH access
- Domain (optional, for easy access)

### Steps:

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/Fellix-234/VenomBot-Tech.git
   cd VenomBot-Tech
   ```

3. **Install Node.js (if needed)**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create .env file**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Edit with your settings

6. **Run with PM2 (for persistence)**
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name "venombot"
   pm2 startup
   pm2 save
   ```

7. **Setup reverse proxy (Nginx)**
   ```bash
   sudo nano /etc/nginx/sites-available/venombot
   ```
   Add:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
     }
   }
   ```

8. **Enable SSL (optional but recommended)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

9. **Access bot**
   - Visit: `http://your-domain.com/qr`
   - Scan QR with WhatsApp

10. **Monitor logs**
    ```bash
    pm2 logs venombot
    ```

---

## Troubleshooting

### Bot starts but QR doesn't appear
- **Render/Railway**: Visit `/qr` endpoint in browser
- **Local**: Wait 5-10 seconds after `node index.js`, check terminal

### "Port already in use" error
- Change PORT: `PORT=3001 node index.js`
- Or kill process: `lsof -i :3000` then `kill -9 <PID>`

### Commands not working
- Bot is linked to your account (dependent device mode)
- To make independent: Get separate WhatsApp number, delete `auth_info_baileys` folder, rescan QR
- See README for more details

### Database errors
- Uses JSON fallback if MongoDB unavailable
- Check database path permissions
- Review `src/database/db.js` for issues

### Performance issues
- Upgrade to paid plan on platform (more RAM/CPU)
- Reduce auto-features (AUTO_READ, AUTO_REACT, etc)
- Disable logging for non-essential messages

---

## Need Help?

- Check [GitHub Issues](https://github.com/Fellix-234/VenomBot-Tech/issues)
- Report problems with your deployment
- Include platform, Node version, and error logs

Happy deploying! 🚀
