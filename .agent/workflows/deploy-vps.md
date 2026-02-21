---
description: How to deploy the CMS to a Hostinger VPS
---

# Hostinger VPS Deployment Workflow

Follow these steps to deploy and maintain your website on a Hostinger VPS.

## 1. Initial Server Setup
Connect to your VPS via SSH:
```bash
ssh root@YOUR_VPS_IP
```

Install Node.js and PM2:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

## 2. Deploy Code
Clone the project and setup environment:
```bash
git clone https://github.com/samadsoomro/FINAL-GCMN-LAVABLE.git /var/www/cms
cd /var/www/cms
cp .env.example .env  # Then edit .env with your real Supabase credentials
```

Install and Build:
```bash
npm install
npm run build
```

## 3. Run with PM2
Launch the server in the background:
// turbo
```bash
pm2 start server/index.ts --interpreter ./node_modules/.bin/tsx --name cms-api
pm2 save
pm2 startup
```

## 4. Nginx Configuration
Create a config file at `/etc/nginx/sites-available/cms`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site:
```bash
ln -s /etc/nginx/sites-available/cms /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```
