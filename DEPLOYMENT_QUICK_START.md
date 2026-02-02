# Quick Deployment Guide

## TL;DR - Deploy in 3 Steps

### Step 1: Set Up Backend Services (15 minutes)

#### MongoDB Atlas
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user (save credentials!)
4. Whitelist IP (0.0.0.0/0 for production)
5. Copy connection string

#### Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Create storage bucket named `images` (make it public)
4. Copy Project URL and anon key from Settings → API

### Step 2: Prepare Environment Variables

You'll need these 6 variables:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/litrary
MONGODB_DB_NAME=litrary
JWT_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 3: Deploy to Vercel (5 minutes)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Add all 6 environment variables
5. Deploy!

**Done!** Your app is live.

---

## Detailed Steps

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

## Common Issues

**MongoDB connection fails:**
- Check IP whitelist includes 0.0.0.0/0
- Verify connection string has correct password
- Ensure database user has proper permissions

**Supabase upload fails:**
- Verify bucket is named `images` and is public
- Check API keys are correct
- Ensure bucket exists before deploying

**Build fails:**
- Check all environment variables are set
- Verify Node.js version (18+)
- Check build logs for specific errors

