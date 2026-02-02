# Deployment Guide

This guide will walk you through deploying Litrary step by step, starting with backend services and then the application.

## Architecture Overview

Litrary is a Next.js full-stack application that includes:
- **Backend API Routes**: Located in `app/api/` (authentication, works, users, comments, etc.)
- **Frontend Pages**: Next.js pages and React components
- **Database**: MongoDB (for user data, works, comments, ratings)
- **File Storage**: Supabase (for avatar images)

## Step 1: Set Up Backend Services

### 1.1 Set Up MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account (M0 Free Tier is sufficient)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the **FREE** (M0) tier
   - Select a cloud provider and region (choose closest to your deployment)
   - Click "Create"

3. **Configure Database Access**
   - Go to **Database Access** in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Set user privileges to "Atlas admin" (or create custom role)
   - Click "Add User"

4. **Configure Network Access**
   - Go to **Network Access** in the left sidebar
   - Click "Add IP Address"
   - For production, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific IPs for better security
   - Click "Confirm"

5. **Get Connection String**
   - Go to **Database** → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `litrary` (or your preferred database name)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/litrary?retryWrites=true&w=majority`

### 1.2 Set Up Supabase (File Storage)

1. **Create Supabase Account**
   - Go to [Supabase](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Enter project name: `litrary` (or your choice)
   - Enter a strong database password (save this!)
   - Select a region (choose closest to your deployment)
   - Click "Create new project"
   - Wait for project to be created (2-3 minutes)

3. **Create Storage Bucket**
   - Go to **Storage** in the left sidebar
   - Click "New bucket"
   - Name: `images`
   - Make it **Public** (toggle "Public bucket")
   - Click "Create bucket"

4. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: (under "Project API keys")

## Step 2: Prepare Environment Variables

Create a list of all environment variables you'll need:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/litrary?retryWrites=true&w=majority
MONGODB_DB_NAME=litrary

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXTAUTH_URL=https://your-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

## Step 3: Deploy the Application

### Option A: Deploy to Vercel (Recommended for Next.js)

Vercel is the easiest platform for deploying Next.js applications.

1. **Prepare Your Repository**
   ```bash
   # Make sure all code is committed
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `./` (default)
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)

3. **Add Environment Variables**
   - In the project settings, go to **Environment Variables**
   - Add all the variables from Step 2:
     - `MONGODB_URI`
     - `MONGODB_DB_NAME`
     - `JWT_SECRET`
     - `NEXTAUTH_URL` (use your Vercel URL: `https://your-project.vercel.app`)
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

5. **Update NEXTAUTH_URL**
   - After first deployment, update `NEXTAUTH_URL` to your actual domain
   - Redeploy if needed

### Option B: Deploy to Other Platforms

#### Railway

1. Go to [Railway](https://railway.app)
2. Create a new project from GitHub repository
3. Add environment variables in the project settings
4. Railway will automatically detect Next.js and deploy

#### Render

1. Go to [Render](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

#### DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
2. Create a new app from GitHub
3. Configure build and start commands
4. Add environment variables
5. Deploy

#### Self-Hosted (VPS/Docker)

1. **Build the application:**
   ```bash
   npm install
   npm run build
   ```

2. **Run with PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "litrary" -- start
   pm2 save
   pm2 startup
   ```

3. **Or use Docker:**
   Create a `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

## Step 4: Post-Deployment Checklist

- [ ] Verify MongoDB connection is working
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating a work
- [ ] Test uploading an avatar (Supabase)
- [ ] Test viewing the feed
- [ ] Test commenting and rating
- [ ] Verify PWA is working (check service worker)
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Configure SSL/HTTPS (usually automatic on Vercel/Railway/Render)

## Step 5: Custom Domain (Optional)

### Vercel
1. Go to project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

### Other Platforms
- Follow platform-specific instructions for custom domains
- Ensure SSL/HTTPS is enabled

## Troubleshooting

### MongoDB Connection Issues
- Verify your IP is whitelisted in MongoDB Atlas
- Check connection string format
- Ensure database user has correct permissions
- Test connection string locally first

### Supabase Issues
- Verify bucket is set to "Public"
- Check API keys are correct
- Ensure CORS is configured (usually automatic)

### Build Errors
- Check all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs for specific errors

### API Route Errors
- Verify JWT_SECRET is set and strong enough
- Check MongoDB connection
- Review server logs for detailed error messages

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `MONGODB_DB_NAME` | Database name | No (default: litrary) | `litrary` |
| `JWT_SECRET` | Secret for JWT signing | Yes | `your-secret-key` |
| `NEXTAUTH_URL` | Base URL of app | Yes | `https://your-domain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJhbGc...` |

## Security Best Practices

1. **Never commit `.env.local` or `.env` files**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Restrict MongoDB network access** to specific IPs when possible
4. **Use environment-specific secrets** (different for dev/staging/prod)
5. **Enable MongoDB authentication** (always use password)
6. **Regularly rotate secrets** in production
7. **Monitor your application logs** for suspicious activity

## Monitoring and Maintenance

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor MongoDB Atlas metrics
- Monitor Supabase usage and limits
- Set up uptime monitoring
- Regular backups of MongoDB data
- Keep dependencies updated

## Support

If you encounter issues:
1. Check the application logs
2. Verify all environment variables are set correctly
3. Test backend services (MongoDB, Supabase) independently
4. Review Next.js build logs for errors

