# Lakeside Farms - Production Deployment Guide

This guide contains essential information for deploying your Lakeside Farms website to production.

---

## 📋 Pre-Deployment Checklist

### 🔐 Security & Configuration

- [ ] **Environment Variables**: Create a `.env` file with production values
  ```env
  NODE_ENV=production
  PORT=3000
  DATABASE_URL=your_production_database_url
  SESSION_SECRET=your_secure_random_string_here
  ADMIN_PASSWORD=your_secure_admin_password
  GOOGLE_MAPS_API_KEY=your_google_maps_api_key
  GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
  ```

- [ ] **Google Maps API Key**:
  - Go to [Google Cloud Console](https://console.cloud.google.com/)
  - Enable Maps JavaScript API and Places API
  - Create an API key
  - Add restrictions (HTTP referrers for your domain)
  - Replace `YOUR_API_KEY_HERE` in `contact.hbs`

- [ ] **Google Analytics**:
  - Create account at [Google Analytics](https://analytics.google.com/)
  - Get your Measurement ID (G-XXXXXXXXXX)
  - Replace `G-XXXXXXXXXX` in all template files (index.hbs, about.hbs, services.hbs, contact.hbs)

- [ ] **Admin Password**:
  - Change default admin credentials
  - Use a strong password (12+ characters, mix of letters, numbers, symbols)

- [ ] **Session Secret**:
  - Generate a secure random string:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

---

## 🗄️ Database Backup Strategy

### SQLite Backups (Current Setup)

**Automated Daily Backups:**

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="./backups"
DB_FILE="./lakeside.db"

mkdir -p $BACKUP_DIR
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/lakeside_$DATE.db'"
echo "Backup created: lakeside_$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "lakeside_*.db" -mtime +30 -delete
EOF

chmod +x backup-db.sh
```

**Setup Cron Job (Linux/Mac):**
```bash
crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /path/to/your/project/backup-db.sh
```

**Windows Task Scheduler:**
```powershell
# Create backup.ps1
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = ".\backups"
$dbFile = ".\lakeside.db"

New-Item -ItemType Directory -Force -Path $backupDir
Copy-Item $dbFile "$backupDir\lakeside_$date.db"
Write-Host "Backup created: lakeside_$date.db"

# Delete backups older than 30 days
Get-ChildItem $backupDir -Filter "lakeside_*.db" | 
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | 
  Remove-Item
```

### Migrating to PostgreSQL (Recommended for Production)

**Why PostgreSQL?**
- Better performance for concurrent users
- More robust for production environments
- Better backup and recovery options

**Migration Steps:**
1. Install PostgreSQL
2. Update `package.json`:
   ```bash
   npm install pg
   ```
3. Update TypeORM configuration
4. Export SQLite data and import to PostgreSQL

---

## 📦 Image Optimization

### Current Optimization:
✅ Lazy loading implemented (`loading="lazy"`)
✅ Async decoding (`decoding="async"`)
✅ Priority hints for hero images

### Additional Recommendations:

**1. Convert images to WebP format:**
```bash
npm install sharp
```

**2. Create image optimization script:**
```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
}
```

**3. Use responsive images:**
```html
<picture>
  <source srcset="image-large.webp" media="(min-width: 1200px)" type="image/webp">
  <source srcset="image-medium.webp" media="(min-width: 768px)" type="image/webp">
  <source srcset="image-small.webp" type="image/webp">
  <img src="image-fallback.jpg" alt="Description" loading="lazy">
</picture>
```

---

## 🚀 Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create lakeside-farms

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_secret

# Deploy
git push heroku main
```

### Option 2: DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Set run command: `npm run start:prod`

### Option 3: AWS (EC2 + S3)
- EC2 for application
- S3 for static assets and uploads
- RDS for PostgreSQL database
- CloudFront for CDN

### Option 4: Vercel (Recommended for Node.js)
```bash
npm install -g vercel
vercel login
vercel
```

---

## 🔧 Error Monitoring Setup

### Sentry Integration (Recommended)

**1. Install Sentry:**
```bash
npm install @sentry/node @sentry/integrations
```

**2. Initialize in main.ts:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**3. Add error handler:**
```typescript
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Alternative: LogRocket
```bash
npm install logrocket
```

---

## 📊 Performance Monitoring

### Tools to Setup:
1. **Google PageSpeed Insights**: Test performance
2. **GTmetrix**: Detailed performance analysis
3. **Uptime Robot**: Monitor uptime (free)
4. **New Relic** or **Datadog**: APM monitoring

---

## 🔒 SSL Certificate

### Free SSL with Let's Encrypt:
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### Or use hosting provider's SSL:
- Heroku: Automatic SSL
- Vercel: Automatic SSL
- DigitalOcean: One-click SSL

---

## 📝 Testing Before Launch

### Cross-Browser Testing:
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile Safari (iOS) ✅
- Chrome Mobile (Android) ✅

### Mobile Testing Tools:
- Chrome DevTools Device Mode
- BrowserStack
- Real device testing

### Performance Testing:
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

---

## 🎯 Post-Launch Checklist

- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics goals/conversions
- [ ] Test contact form submissions
- [ ] Verify Google Maps directions work
- [ ] Check all images load correctly
- [ ] Test admin panel on production
- [ ] Set up automated backups
- [ ] Configure error monitoring
- [ ] Set up uptime monitoring
- [ ] Test WhatsApp and email contact methods
- [ ] Verify mobile responsiveness
- [ ] Check all internal links work
- [ ] Test form validation

---

## 📞 Support & Maintenance

### Regular Tasks:
- **Daily**: Check error logs
- **Weekly**: Review analytics, check backup logs
- **Monthly**: Update dependencies, security audit
- **Quarterly**: Performance optimization review

### Security Updates:
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

---

## 🆘 Troubleshooting

### Common Issues:

**1. Port already in use:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

**2. Database locked:**
- Ensure no other process is accessing the database
- Check file permissions

**3. Images not loading:**
- Verify file paths are correct
- Check file permissions
- Ensure static assets are being served

**4. Maps not working:**
- Verify API key is correct
- Check API is enabled in Google Cloud Console
- Verify billing is enabled (if required)

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Helmet Security Best Practices](https://helmetjs.github.io/)
- [Web.dev Performance Guide](https://web.dev/performance/)

---

**Good luck with your deployment! 🚀**
