# DEPLOYMENT & PRODUCTION GUIDE

## ✅ Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to unique strong key (32+ characters)
- [ ] Update `MONGODB_URI` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Remove debug logging
- [ ] Implement rate limiting
- [ ] Add HTTPS enforcement
- [ ] Test password hashing with strong passwords
- [ ] Review CORS configuration

### Backend
- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] Environment variables documented
- [ ] Database connection stable
- [ ] API endpoints tested
- [ ] No console.log statements (except errors)
- [ ] Dependencies updated: `npm update`
- [ ] Security audit: `npm audit fix`

### Frontend
- [ ] Build succeeds: `npm run build`
- [ ] No console errors or warnings
- [ ] All pages tested
- [ ] Forms validated
- [ ] Token handling correct
- [ ] API URLs match production
- [ ] Responsive design tested
- [ ] Performance optimized

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Backups scheduled
- [ ] Indexes optimized
- [ ] User collection schema validated
- [ ] Test user created

---

## 🚀 Backend Deployment

### Option 1: Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Deployment Steps

1. **Create Heroku App**
   ```bash
   heroku create lycaon-auth-api
   heroku config:set JWT_SECRET="your_strong_secret_key"
   heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/lycaon-auth"
   heroku config:set NODE_ENV="production"
   ```

2. **Deploy Code**
   ```bash
   git add .
   git commit -m "Production deployment"
   git push heroku main
   ```

3. **View Logs**
   ```bash
   heroku logs --tail
   ```

#### Important Files for Heroku
- `Procfile` (optional, auto-detects):
  ```
  web: node server.js
  ```
- `package.json` (must have start script)

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier eligible)
   - Security group: ports 22, 80, 443, 5000

2. **Setup Instance**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo apt install -y mongodb
   ```

3. **Deploy Backend**
   ```bash
   git clone <repo-url>
   cd backend
   npm install --production
   npm start
   ```

4. **Use PM2 for Management**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "lycaon-api"
   pm2 startup
   pm2 save
   ```

### Option 3: DigitalOcean App Platform

1. **Connect Repository**
   - Link GitHub account
   - Select repository

2. **Configure**
   - Environment: Node.js
   - Build command: `npm install`
   - Run command: `npm start`

3. **Set Environment Variables**
   - PORT: 8080
   - JWT_SECRET: your_key
   - MONGODB_URI: your_uri
   - NODE_ENV: production

4. **Deploy**
   - Click Deploy
   - Monitor logs

---

## 🎨 Frontend Deployment

### Option 1: Netlify

#### Method A: Drag & Drop
```bash
npm run build
# Drag 'build' folder to Netlify
```

#### Method B: GitHub Integration
1. Push code to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Set environment: `REACT_APP_API_URL=https://your-api.com`

#### Environment Variables in Netlify
```
REACT_APP_API_URL=https://your-api-backend.com
```

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure**
   - Project name: lycaon-auth-frontend
   - Framework: Create React App
   - Root directory: ./

4. **Add Environment Variables**
   - REACT_APP_API_URL: https://your-api.com

### Option 3: GitHub Pages

1. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/lycaon-auth"
   }
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

---

## 🗄️ Database Setup (Production)

### MongoDB Atlas Cloud

1. **Create Account**
   - Visit mongodb.com/cloud/atlas
   - Sign up free account

2. **Create Cluster**
   - Select AWS, US region
   - Choose M0 (free tier)

3. **Setup Users**
   - Create database user
   - Set strong password
   - Remember username/password

4. **Network Access**
   - Add IP: 0.0.0.0/0 (or specific IPs)
   - Click "Allow Access from Anywhere"

5. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/lycaon-auth?retryWrites=true&w=majority
   ```

6. **Update Backend .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lycaon-auth
   ```

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# On your server
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### Configure Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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

---

## 📊 Monitoring & Logging

### Backend Logging

Add logging to `server.js`:
```javascript
const fs = require('fs');
const path = require('path');

app.use((req, res, next) => {
  const log = `${new Date().toISOString()} ${req.method} ${req.path}\n`;
  fs.appendFileSync(path.join(__dirname, 'logs.txt'), log);
  next();
});
```

### Monitor with PM2

```bash
pm2 logs
pm2 monit
pm2 status
```

### Heroku Monitoring

```bash
heroku logs --tail
heroku ps
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Build Backend
        run: |
          cd backend
          npm install
          npm test

      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build

      - name: Deploy
        run: |
          # Add your deployment commands
```

---

## 📈 Performance Optimization

### Backend

1. **Enable Compression**
   ```bash
   npm install compression
   ```
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add Caching**
   ```javascript
   app.set('Cache-Control', 'public, max-age=300');
   ```

3. **Database Indexes**
   ```javascript
   userSchema.index({ email: 1 });
   ```

### Frontend

1. **Code Splitting**
   ```javascript
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   ```

2. **Image Optimization**
   - Compress images
   - Use WebP format
   - Resize for mobile

3. **Bundle Analysis**
   ```bash
   npm install --save-dev source-map-explorer
   npm run build
   npx source-map-explorer 'build/static/js/*.js'
   ```

---

## 🆘 Troubleshooting Production

### API Not Responding
```bash
# Check process
pm2 status
# Restart
pm2 restart all
# View logs
pm2 logs
```

### Database Connection Issues
```bash
# Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/lycaon-auth"
```

### CORS Errors in Production
Update backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
```

### Memory Issues
```bash
# Check memory
node --max-old-space-size=4096 server.js
# Or configure in PM2
pm2 start server.js --max-memory-restart 400M
```

---

## 📋 Post-Deployment

### Verify Everything Works
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Dashboard loads
- [ ] Can logout
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] SSL working

### Setup Backups
- Database: Automatic with MongoDB Atlas
- Code: GitHub repository
- Environment: Document in secure location

### Setup Monitoring
- Error tracking: Sentry, Rollbar
- Performance: DataDog, New Relic
- Uptime: UptimeRobot, Pingdom

---

## 🔐 Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enable CORS properly
- [ ] Secure password hashing
- [ ] Implement logging
- [ ] Regular backups
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Monitor for suspicious activity

---

## 📞 Support Resources

- **MongoDB Atlas Docs**: docs.mongodb.com
- **Heroku Docs**: devcenter.heroku.com
- **Netlify Docs**: docs.netlify.com
- **Vercel Docs**: vercel.com/docs
- **Node.js Docs**: nodejs.org/docs

---

**Deployment complete! 🎉 Your authentication system is live.**
