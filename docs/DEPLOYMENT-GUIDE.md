# Secure Deployment Guide 🚀

This guide shows you how to deploy your College Transfer Counselor AI application to a server while keeping your API keys secure.

## 🔐 Security First: API Key Protection

### ⚠️ NEVER DO THESE:
- ❌ Put API keys in your code files
- ❌ Commit `.env` files to Git
- ❌ Share API keys in plain text
- ❌ Use production keys in development

### ✅ SECURE APPROACHES:

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- ✅ Built for Next.js applications
- ✅ Automatic HTTPS
- ✅ Secure environment variables
- ✅ Free tier available
- ✅ Easy custom domains

**Steps:**
1. **Prepare your repository:**
   ```bash
   # Remove sensitive files from git
   git rm -r --cached .env.local .env
   
   # Update .gitignore
   echo ".env*" >> .gitignore
   echo "!.env.example" >> .gitignore
   ```

2. **Create environment template:**
   ```bash
   # Create .env.example (safe to commit)
   cp .env.local .env.example
   ```

3. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

4. **Add environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add each environment variable securely
   - Deploy again: `vercel --prod`

### Option 2: Railway (Simple & Affordable)

**Steps:**
1. **Connect GitHub repository**
2. **Add environment variables in Railway dashboard**
3. **Deploy automatically**

**Railway Setup:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Option 3: DigitalOcean App Platform

**Steps:**
1. **Connect your GitHub repository**
2. **Configure build settings:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. **Add environment variables in dashboard**
4. **Deploy**

### Option 4: Self-Hosted VPS (Advanced)

**Requirements:**
- Ubuntu/CentOS server
- Node.js 18+
- PM2 or similar process manager
- Nginx reverse proxy
- SSL certificate (Let's Encrypt)

## 🔧 Production Configuration

### 1. Create Production Environment File

Create `.env.production` (never commit this):

```env
# Production Environment Variables
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key

# OpenAI Configuration
OPENAI_API_KEY=your-production-openai-key

# DataStax Astra DB Configuration
ASTRA_DB_API_ENDPOINT=your-production-endpoint
ASTRA_DB_APPLICATION_TOKEN=your-production-token
ASTRA_DB_NAMESPACE=production_keyspace
ASTRA_DB_COLLECTION=ASSIST_GPT
```

### 2. Update Package.json for Production

Add production scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p 3000",
    "seed:prod": "NODE_ENV=production ts-node ./scripts/loadDb-refactored.ts"
  }
}
```

### 3. Create Production Docker Setup (Optional)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

## 🛡️ Security Best Practices

### 1. Environment Variable Management

**Create .env.example:**
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# DataStax Astra DB Configuration
ASTRA_DB_API_ENDPOINT=https://your-database-endpoint
ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token-here
ASTRA_DB_NAMESPACE=your_keyspace
ASTRA_DB_COLLECTION=your_collection
```

### 2. Update .gitignore

```gitignore
# Environment files
.env*
!.env.example

# Production files
.env.production
.env.local

# Sensitive data
*.pem
*.key
/scripts/scraping-progress.json

# Build files
.next/
out/
dist/
```

### 3. Add Security Headers

Create `config/security.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = securityHeaders
```

Update `next.config.js`:
```javascript
const securityHeaders = require('./config/security.js')

const nextConfig = {
  // ... existing config
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 🚀 Step-by-Step Deployment

### Quick Vercel Deployment (Recommended)

1. **Prepare Repository:**
   ```bash
   # Clean up sensitive files
   rm .env.local .env
   
   # Create safe template
   cat > .env.example << EOF
   OPENAI_API_KEY=your-openai-key-here
   ASTRA_DB_API_ENDPOINT=your-astra-endpoint
   ASTRA_DB_APPLICATION_TOKEN=your-astra-token
   ASTRA_DB_NAMESPACE=default_keyspace
   ASTRA_DB_COLLECTION=ASSIST_GPT
   EOF
   
   # Commit changes
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in dashboard
   - Deploy!

3. **Load Data (One-time):**
   ```bash
   # Set environment variables locally
   vercel env pull .env.local
   
   # Run data seeding
   npm run seed:refactored
   ```

### Alternative: Railway Deployment

1. **Connect Repository:**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository

2. **Configure Environment:**
   - Add all environment variables in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy:**
   - Railway automatically deploys on git push
   - Get your public URL

## 🔍 Monitoring & Maintenance

### 1. Health Checks

Add to your API:
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  })
}
```

### 2. Error Monitoring

Consider adding:
- Sentry for error tracking
- Vercel Analytics for usage metrics
- Uptime monitoring (UptimeRobot)

### 3. Regular Updates

```bash
# Update dependencies
npm update

# Security audit
npm audit

# Redeploy
vercel --prod
```

## ✅ Deployment Checklist

- [ ] API keys removed from code
- [ ] `.env` files in `.gitignore`
- [ ] Environment variables set in hosting dashboard
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Security headers added
- [ ] Health check endpoint working
- [ ] Database seeded with university data
- [ ] Error monitoring setup
- [ ] Regular backup strategy planned

## 🌟 Recommended Setup

**For beginners:** Vercel + GitHub
**For teams:** Railway or DigitalOcean
**For enterprises:** AWS/GCP with Docker

Your application will be accessible at your deployment URL with full functionality while keeping your API keys completely secure! 🎉