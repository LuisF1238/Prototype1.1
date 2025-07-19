# ⚡ Quick Deploy Guide

## 🚀 Deploy to Vercel (Easiest - 5 minutes)

### Step 1: Prepare Repository
```bash
# Clean up sensitive files (IMPORTANT!)
rm .env .env.local
git add .
git commit -m "Prepare for secure deployment"
git push
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project" 
3. Import your GitHub repository
4. **CRITICAL**: Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY` = `your-openai-key`
   - `ASTRA_DB_API_ENDPOINT` = `your-astra-endpoint` 
   - `ASTRA_DB_APPLICATION_TOKEN` = `your-astra-token`
   - `ASTRA_DB_NAMESPACE` = `default_keyspace`
   - `ASTRA_DB_COLLECTION` = `ASSIST_GPT`
5. Click "Deploy"

### Step 3: Load University Data (One-time)
```bash
# Install Vercel CLI
npm install -g vercel

# Pull environment variables locally
vercel env pull .env.local

# Load university data into database
npm run seed:refactored

# Clean up local env file
rm .env.local
```

### Step 4: Test Your Deployment
- Visit your Vercel URL
- Test the chat functionality
- Check health endpoint: `your-url.vercel.app/api/health`

## 🌐 Alternative: Railway (Also Easy)

### Step 1: Deploy
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add the same environment variables
4. Deploy automatically happens

### Step 2: Load Data
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect
railway login
railway link your-project-id

# Set environment variables and run seeding
railway run npm run seed:refactored
```

## ✅ Security Checklist

Before deployment, ensure:

- [ ] No `.env` files committed to Git
- [ ] API keys set in hosting dashboard (not in code)
- [ ] `.env.example` template created
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] Security headers configured (already done)
- [ ] Health check endpoint working

## 🔧 Useful Commands

```bash
# Check what will be deployed
git status
git log --oneline -5

# Test locally before deployment
npm run build
npm start

# Security audit
npm run security:audit

# Deploy to Vercel
npm run deploy:vercel

# Pull production environment variables
npm run env:pull
```

## 🆘 Troubleshooting

### Build Errors
- Check environment variables are set in dashboard
- Verify all dependencies in package.json
- Test build locally first

### Runtime Errors  
- Check health endpoint: `/api/health`
- Verify database connection
- Check function logs in hosting dashboard

### API Key Issues
- Never put keys in code files
- Set them in hosting platform dashboard
- Use `.env.example` as template

Your app will be live and secure at: `https://your-project.vercel.app` 🎉

---

**⚠️ Remember: Never commit real API keys to Git!**