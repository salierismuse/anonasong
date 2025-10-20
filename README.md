# Anonasong

An anonymous music confessional platform where users leave songs as digital flowers in personal gardens. A poetic space for musical expression without social complexity.

## Features

- **Pure Anonymity**: No accounts, no tracking, no attribution
- **One-Way Expression**: No replies, likes, or interaction
- **Temporal Beauty**: Gardens grow and evolve naturally
- **Universal Access**: Anyone can visit any garden

## Tech Stack

- **Next.js 14** with App Router
- **Tailwind CSS** for styling
- **Supabase** for database (gardens and flowers only)
- **TypeScript** for type safety

## Database Schema

The application uses two main tables:

### Gardens
- `id`: UUID primary key
- `name`: VARCHAR(15) - unique garden name
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Flowers
- `id`: UUID primary key
- `garden_id`: Foreign key to gardens
- `song_title`: Song title
- `artist`: Artist name
- `song_url`: Optional URL to song
- `note`: Optional note (max 20 words)
- `created_at`: Timestamp

## Constraints

- **24 flowers per page** - gardens can have unlimited flowers with pagination
- **100 characters maximum** for notes
- **15 characters maximum** for garden names
- **No deletion** - all flowers are permanent

## Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Copy your project URL and anon key

3. **Configure environment variables:**
   - Update `.env.local` with your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Usage

1. **Find a Garden**: Search for someone's name to visit their garden
2. **Plant a Flower**: Leave a song with an optional note
3. **Discover Randomly**: Explore random gardens to find new music
4. **Watch Gardens Grow**: Gardens accumulate flowers over time

## Design Philosophy

Anonasong represents a return to simpler, more poetic internet interactions. By removing the complexities of modern social platforms—accounts, metrics, interactions—it creates space for pure human expression through the universal language of music.

Each garden becomes a living testament to how others see and remember us, growing organically through anonymous acts of musical kindness.

## Privacy

- No user accounts or authentication
- No analytics or tracking
- No cookies beyond functional storage
- Complete anonymity for all interactions