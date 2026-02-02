# Litrary - A Platform for Writers and Readers

A modern web platform built with Next.js, MongoDB, and JWT authentication where users can publish poems and short stories, interact with each other, and discover high-quality writing through ratings and social features.

## Features

### Core Features

- **Authentication**
  - User signup & login with JWT
  - Username, display name, and avatar support
  - Protected routes for writing, commenting, and rating

- **Writing & Publishing**
  - Create, edit, and delete poems and short stories
  - Markdown support for rich text formatting
  - Beautiful display for reading

- **Rating System**
  - 1-5 star ratings
  - One rating per user per work (can update)
  - Average rating and total ratings display

- **Comment System**
  - Comments on works
  - Nested replies support
  - Comment count per work

- **Writer Score Calculation**
  - Formula: `averageWorkRating × log10(totalWorks + 1)`
  - Displays writer score, average rating, and total works count

- **Follow / Unfollow System**
  - Follow and unfollow other users
  - Followers and following counts
  - Follow button on profile pages

- **Feed System**
  - Global Feed: Latest and trending works
  - Following Feed: Works from followed users
  - Feed cards with preview, rating, and comment counts

- **User Profile Page**
  - Avatar, display name, username, and bio
  - Writer Score, average rating, and works count
  - Followers/Following counts
  - Grid/list of published works with ratings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Storage**: Supabase (for avatar images)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS with responsive design
- **Markdown**: react-markdown for content rendering

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB instance (local or cloud like MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Litrary
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=litrary
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration (for avatar storage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important**: 
- Replace `JWT_SECRET` with a strong, random secret key for production.
- Set up Supabase for avatar storage (see Supabase Setup below).

4. Start the development server:
```bash
npm run dev
```

5. Set up Supabase for avatar storage (see Supabase Setup below).

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Storage** in the Supabase dashboard
4. Create a new bucket named `images` with **public access**
5. Copy your project URL and anon key from **Settings** > **API**
6. Add them to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Project Structure

```
Litrary/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── works/         # Work CRUD endpoints
│   │   ├── users/         # User endpoints
│   │   └── feed/          # Feed endpoints
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── create/            # Create work page
│   ├── works/             # Work detail and edit pages
│   └── profile/            # User profile pages
├── components/             # Reusable React components
├── contexts/               # React contexts (Auth)
├── lib/                    # Utility functions
│   ├── mongodb.ts         # MongoDB connection
│   ├── auth.ts            # JWT utilities
│   └── writerScore.ts     # Writer score calculation
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Works
- `GET /api/works` - Get works (with filters)
- `POST /api/works` - Create new work
- `GET /api/works/[id]` - Get work by ID
- `PUT /api/works/[id]` - Update work
- `DELETE /api/works/[id]` - Delete work

### Ratings
- `GET /api/works/[id]/ratings` - Get ratings for a work
- `POST /api/works/[id]/ratings` - Rate a work

### Comments
- `GET /api/works/[id]/comments` - Get comments for a work
- `POST /api/works/[id]/comments` - Create comment
- `PUT /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

### Users
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user profile
- `POST /api/users/[id]/follow` - Follow user
- `DELETE /api/users/[id]/follow` - Unfollow user

### Feed
- `GET /api/feed?type=global` - Get global feed
- `GET /api/feed?type=following` - Get following feed

## Usage

1. **Sign Up**: Create a new account with username, display name, email, and password
2. **Login**: Sign in with your credentials
3. **Create Work**: Click "Create" to publish a poem or short story
4. **Rate Works**: Click on stars to rate works (1-5 stars)
5. **Comment**: Add comments and replies to works
6. **Follow Users**: Visit user profiles and click "Follow" to see their works in your Following feed
7. **View Profile**: Check your writer score, ratings, and published works on your profile

## Writer Score Formula

The writer score is calculated using:
```
writerScore = averageWorkRating × log10(totalWorks + 1)
```

This formula rewards both quality (average rating) and quantity (number of works) while using a logarithmic scale to prevent excessive quantity from overshadowing quality.

## Responsive Design

The platform is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: Database name (default: litrary)
- `JWT_SECRET`: Secret key for JWT token signing
- `NEXTAUTH_URL`: Base URL of the application

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

