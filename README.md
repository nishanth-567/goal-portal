# GoalTrack — AI-Powered Goal Setting & Tracking Portal

A full-stack performance management portal built with Next.js 14, PostgreSQL, Prisma, and Claude AI.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials-based)
- **AI**: Anthropic Claude API

## Demo Accounts
| Role | Email | Password | 
|------|-------|----------|
| Employee | employee@demo.com | demo123 |
| Manager | manager@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/goal_portal"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-secret-string"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 3. Set up the database
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run dev server
```bash
npm run dev
```
Open http://localhost:3000

---

## Vercel Deployment

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/goal-portal.git
git push -u origin main
```

### Step 2 — Create a PostgreSQL database
Use one of these (all have free tiers):
- **Neon** (recommended): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

Copy the `DATABASE_URL` connection string.

### Step 3 — Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add these **Environment Variables**:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `NEXTAUTH_URL` — your Vercel URL (e.g. `https://goal-portal.vercel.app`)
   - `NEXTAUTH_SECRET` — any random 32-char string (generate at https://generate-secret.vercel.app)
   - `ANTHROPIC_API_KEY` — your key from https://console.anthropic.com
4. Click **Deploy**

### Step 4 — Seed the database
After deploy, run this once from your local machine pointing to the production DB:
```bash
DATABASE_URL="your-production-db-url" npx prisma db push
DATABASE_URL="your-production-db-url" npx prisma db seed
```

---

## Features
- ✅ Goal creation with AI quality scoring
- ✅ Natural language goal parsing (AI)
- ✅ AI goal suggestions by thrust area
- ✅ Manager approval workflow (inline edit, approve, return)
- ✅ Quarterly check-ins with auto score computation
- ✅ AI check-in summarizer
- ✅ Analytics dashboard with QoQ trends, heatmaps
- ✅ AI analytics narrative generator
- ✅ CSV export
- ✅ Audit trail
- ✅ Role-based access (Employee / Manager / Admin)
- ✅ Admin panel (users, cycles, thrust areas)
