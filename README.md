# AssetIQ — Enterprise Asset Management
### Powered by Xeltr

Zero-cost · AI-powered · Microsoft SSO · Dark/Light mode

---

## Quick setup (follow in order)

### 1. Install on your computer
```bash
# Clone the project
git clone https://github.com/YOUR_USERNAME/assetiq.git
cd assetiq

# Install all packages
npm install

# Generate Prisma client
npm run db:generate
```

### 2. Set up environment variables
```bash
# Copy the example file
cp .env.example .env

# Open .env in VS Code and fill in your values
code .env
```

Fill in:
- `DATABASE_URL` — from your Neon dashboard
- `AUTH_SECRET` — generate at https://generate-secret.vercel.app/32
- `OPENAI_API_KEY` — from platform.openai.com
- `CLOUDINARY_*` — from cloudinary.com dashboard
- `SMTP_*` — your Gmail + app password

### 3. Set up the database
```bash
npm run db:push
```

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000 — you should see the login page!

### 5. Create your admin account
Go to http://localhost:3000/auth/register — the **first account created is automatically admin**.

### 6. Deploy to Vercel
1. Push code to GitHub: `git add . && git commit -m "Initial commit" && git push`
2. Go to vercel.com → New project → Import your GitHub repo
3. Add all your `.env` variables in Vercel's Environment Variables section
4. Deploy!

### 7. Set up GitHub Actions secrets
In your GitHub repo → Settings → Secrets → Actions, add:
- `APP_URL` — your Vercel URL (e.g. https://assetiq.vercel.app)
- `CRON_SECRET` — any random string (same as in your .env)
- `VERCEL_TOKEN` — from vercel.com/account/tokens
- `VERCEL_ORG_ID` — from .vercel/project.json after first deploy
- `VERCEL_PROJECT_ID` — from .vercel/project.json after first deploy

---

## Device auto-discovery

### Option A: Network scan (no install on devices)
Use a tool like Angry IP Scanner on your network and export CSV, then import via the Discovery page.

### Option B: Windows agent (runs on each PC)
1. Go to **Discovery** page in AssetIQ
2. Copy the PowerShell script
3. Replace `REPLACE_WITH_YOUR_APP_URL` with your Vercel URL
4. Run it on each Windows device as Administrator

### Option C: CSV import
Download the template from the Assets page and fill in your existing asset list.

---

## Tech stack (all free)
| Tool | Purpose | Cost |
|------|---------|------|
| Next.js 14 | Frontend + backend | Free |
| Vercel | Hosting | Free |
| Neon Postgres | Database | Free |
| Prisma | Database ORM | Free |
| NextAuth.js | Login (email + Microsoft) | Free |
| OpenAI | AI features | Free tier |
| Cloudinary | File/image storage | Free |
| GitHub Actions | Automation + cron | Free |

---

Built by [Xeltr](https://xeltr.com) · AssetIQ
