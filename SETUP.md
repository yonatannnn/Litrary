# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up MongoDB

You have two options:

### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Add your IP to the whitelist

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

MONGODB_DB_NAME=litrary
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration (for avatar storage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important**: 
- Replace `JWT_SECRET` with a strong random string (at least 32 characters)
- You can generate one using: `openssl rand -base64 32`
- Set up Supabase for avatar storage (see Step 4)

## Step 4: Set Up Supabase for Avatar Storage

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Storage** in the Supabase dashboard
4. Click **New bucket**
5. Name it `images` and make it **Public**
6. Go to **Settings** > **API** in your Supabase dashboard
7. Copy your **Project URL** and **anon/public key**
8. Add them to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Step 5: Run the Development Server

```bash
npm run dev
```

## Step 6: Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Sign Up**: Create your account
2. **Create Work**: Publish your first poem or short story
3. **Explore**: Browse the global feed and discover other writers
4. **Interact**: Rate and comment on works
5. **Follow**: Follow writers you like to see their works in your Following feed

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local)
- Check your connection string
- Verify network access (if using Atlas)

### JWT Errors
- Make sure `JWT_SECRET` is set in `.env.local`
- Restart the dev server after changing environment variables

### Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Run `npm run dev`

## Production Deployment

1. Set environment variables in your hosting platform
2. Build the project: `npm run build`
3. Start production server: `npm start`

For Vercel deployment:
- Connect your GitHub repository
- Add environment variables in Vercel dashboard
- Deploy automatically on push

